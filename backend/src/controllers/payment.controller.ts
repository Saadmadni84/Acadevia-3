import { Request, Response } from 'express';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '../config/database';
import { AuthRequest } from '../types/auth.types';
import { PaymentService } from '../services/payment.service';

// Initialize payment gateways
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
});

export class PaymentController {
  // POST /payments/initiate
  static async initiatePayment(req: AuthRequest, res: Response) {
    try {
      const { 
        courseId, 
        amount, 
        currency = 'usd', 
        provider = 'stripe',
        discountCode
      } = req.body;
      
      // Validate required fields
      if (!courseId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Course ID and amount are required'
        });
      }

      // Verify course exists and is available for purchase
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: {
          id: true,
          title: true,
          price: true,
          instructor: {
            select: { name: true }
          }
        }
      });

      if (!course) {
        return res.status(404).json({ 
          success: false, 
          message: 'Course not found' 
        });
      }

      // Check if user already enrolled
      const existingEnrollment = await prisma.courseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId: req.userId!,
            courseId
          }
        }
      });

      if (existingEnrollment) {
        return res.status(400).json({
          success: false,
          message: 'Already enrolled in this course'
        });
      }

      // Apply discount if provided
      let finalAmount = amount;
      let appliedDiscount = null;

      if (discountCode) {
        const discount = await PaymentService.validateDiscountCode(discountCode, courseId);
        if (discount) {
          finalAmount = PaymentService.applyDiscount(amount, discount);
          appliedDiscount = discount;
        }
      }

      let paymentData: any = {};
      let paymentRecord: any = {};

      // Handle different payment providers
      if (provider === 'stripe') {
        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(finalAmount * 100), // Convert to cents
          currency,
          automatic_payment_methods: {
            enabled: true,
          },
          metadata: {
            courseId,
            userId: req.userId!,
            originalAmount: amount.toString(),
            discountApplied: appliedDiscount?.amount?.toString() || '0'
          }
        });

        paymentData = {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id
        };

        paymentRecord = {
          stripePaymentIntentId: paymentIntent.id
        };

      } else if (provider === 'razorpay') {
        // Create Razorpay order
        const order = await razorpay.orders.create({
          amount: Math.round(finalAmount * 100), // Convert to paise
          currency: currency.toUpperCase(),
          receipt: `course_${courseId}_${Date.now()}`,
          notes: {
            courseId,
            userId: req.userId!,
            originalAmount: amount.toString(),
            discountApplied: appliedDiscount?.amount?.toString() || '0'
          }
        });

        paymentData = {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          key: process.env.RAZORPAY_KEY_ID
        };

        paymentRecord = {
          razorpayOrderId: order.id
        };

      } else {
        return res.status(400).json({
          success: false,
          message: 'Unsupported payment provider'
        });
      }

      // Save payment record in database
      const payment = await prisma.payment.create({
        data: {
          userId: req.userId!,
          courseId,
          amount: finalAmount,
          originalAmount: amount,
          currency,
          status: 'pending',
          provider,
          discountCode: appliedDiscount?.code || null,
          discountAmount: appliedDiscount?.amount || 0,
          ...paymentRecord
        }
      });

      res.status(200).json({
        success: true,
        message: 'Payment initiated successfully',
        data: {
          paymentId: payment.id,
          course: {
            id: course.id,
            title: course.title,
            instructor: course.instructor.name
          },
          amount: finalAmount,
          originalAmount: amount,
          currency,
          provider,
          appliedDiscount,
          ...paymentData
        }
      });

    } catch (error) {
      console.error('Initiate payment error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to initiate payment' 
      });
    }
  }

  // POST /payments/webhook/stripe
  static async handleStripeWebhook(req: Request, res: Response) {
    try {
      const sig = req.headers['stripe-signature'] as string;
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err) {
        console.error('Stripe webhook signature verification failed:', err);
        return res.status(400).send('Webhook signature verification failed');
      }

      // Handle payment events
      switch (event.type) {
        case 'payment_intent.succeeded':
          await PaymentController.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'payment_intent.payment_failed':
          await PaymentController.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.canceled':
          await PaymentController.handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
          break;

        default:
          console.log(`Unhandled Stripe event type: ${event.type}`);
      }

      res.status(200).json({ received: true });

    } catch (error) {
      console.error('Stripe webhook error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Webhook processing failed' 
      });
    }
  }

  // POST /payments/webhook/razorpay
  static async handleRazorpayWebhook(req: Request, res: Response) {
    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
      const receivedSignature = req.headers['x-razorpay-signature'] as string;

      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (receivedSignature !== expectedSignature) {
        return res.status(400).send('Invalid signature');
      }

      const { event, payload } = req.body;

      switch (event) {
        case 'payment.captured':
          await PaymentController.handleRazorpayPaymentSuccess(payload.payment.entity);
          break;
        
        case 'payment.failed':
          await PaymentController.handleRazorpayPaymentFailed(payload.payment.entity);
          break;

        default:
          console.log(`Unhandled Razorpay event type: ${event}`);
      }

      res.status(200).json({ status: 'ok' });

    } catch (error) {
      console.error('Razorpay webhook error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Webhook processing failed' 
      });
    }
  }

  // POST /payments/verify/razorpay
  static async verifyRazorpayPayment(req: AuthRequest, res: Response) {
    try {
      const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature 
      } = req.body;

      // Verify payment signature
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed'
        });
      }

      // Find payment record
      const payment = await prisma.payment.findFirst({
        where: {
          razorpayOrderId: razorpay_order_id,
          userId: req.userId!
        }
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment record not found'
        });
      }

      // Update payment record and enroll user
      await PaymentController.completePayment(payment.id, razorpay_payment_id);

      res.status(200).json({
        success: true,
        message: 'Payment verified and enrollment completed'
      });

    } catch (error) {
      console.error('Verify Razorpay payment error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Payment verification failed' 
      });
    }
  }

  // GET /payments/status/:id
  static async getPaymentStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const payment = await prisma.payment.findFirst({
        where: { 
          id,
          userId: req.userId!
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              thumbnail: true,
              price: true
            }
          }
        }
      });

      if (!payment) {
        return res.status(404).json({ 
          success: false, 
          message: 'Payment not found' 
        });
      }

      res.status(200).json({
        success: true,
        payment
      });

    } catch (error) {
      console.error('Get payment status error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get payment status' 
      });
    }
  }

  // GET /payments/history
  static async getPaymentHistory(req: AuthRequest, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status,
        startDate,
        endDate
      } = req.query;

      const where: any = { userId: req.userId! };
      
      if (status) where.status = status;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate as string);
        if (endDate) where.createdAt.lte = new Date(endDate as string);
      }

      const payments = await prisma.payment.findMany({
        where,
        include: {
          course: {
            select: {
              id: true,
              title: true,
              thumbnail: true,
              instructor: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: (parseInt(page as string) - 1) * parseInt(limit as string)
      });

      const total = await prisma.payment.count({ where });

      // Calculate summary statistics
      const stats = await prisma.payment.aggregate({
        where: { 
          userId: req.userId!,
          status: 'completed'
        },
        _sum: { amount: true },
        _count: { id: true }
      });

      res.status(200).json({
        success: true,
        payments,
        pagination: {
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
          page: parseInt(page as string),
          limit: parseInt(limit as string)
        },
        stats: {
          totalSpent: stats._sum.amount || 0,
          totalPurchases: stats._count.id || 0
        }
      });

    } catch (error) {
      console.error('Get payment history error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get payment history' 
      });
    }
  }

  // POST /payments/refund
  static async initiateRefund(req: AuthRequest, res: Response) {
    try {
      const { paymentId, reason } = req.body;

      const payment = await prisma.payment.findFirst({
        where: { 
          id: paymentId,
          userId: req.userId!,
          status: 'completed'
        },
        include: {
          course: { select: { title: true } }
        }
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found or not eligible for refund'
        });
      }

      // Check refund eligibility (e.g., within 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      if (payment.completedAt! < thirtyDaysAgo) {
        return res.status(400).json({
          success: false,
          message: 'Refund period has expired'
        });
      }

      let refundResult;

      if (payment.stripePaymentIntentId) {
        // Process Stripe refund
        refundResult = await stripe.refunds.create({
          payment_intent: payment.stripePaymentIntentId,
          reason: 'requested_by_customer',
          metadata: { reason }
        });
      } else if (payment.razorpayPaymentId) {
        // Process Razorpay refund
        refundResult = await razorpay.payments.refund(payment.razorpayPaymentId, {
          amount: payment.amount * 100,
          notes: { reason }
        });
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: paymentId },
        data: { 
          status: 'refunded',
          refundReason: reason,
          refundedAt: new Date()
        }
      });

      // Remove course enrollment
      await prisma.courseEnrollment.delete({
        where: {
          userId_courseId: {
            userId: req.userId!,
            courseId: payment.courseId
          }
        }
      });

      res.status(200).json({
        success: true,
        message: 'Refund initiated successfully',
        refund: refundResult
      });

    } catch (error) {
      console.error('Initiate refund error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to initiate refund' 
      });
    }
  }

  // Helper methods
  private static async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    try {
      const payment = await prisma.payment.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id }
      });

      if (payment) {
        await PaymentController.completePayment(payment.id, paymentIntent.id);
      }
    } catch (error) {
      console.error('Handle payment success error:', error);
    }
  }

  private static async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    try {
      await prisma.payment.updateMany({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: { 
          status: 'failed',
          failureReason: paymentIntent.last_payment_error?.message || 'Payment failed'
        }
      });
    } catch (error) {
      console.error('Handle payment failed error:', error);
    }
  }

  private static async handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
    try {
      await prisma.payment.updateMany({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: { status: 'canceled' }
      });
    } catch (error) {
      console.error('Handle payment canceled error:', error);
    }
  }

  private static async handleRazorpayPaymentSuccess(paymentData: any) {
    try {
      const payment = await prisma.payment.findFirst({
        where: { razorpayOrderId: paymentData.order_id }
      });

      if (payment) {
        await PaymentController.completePayment(payment.id, paymentData.id);
      }
    } catch (error) {
      console.error('Handle Razorpay payment success error:', error);
    }
  }

  private static async handleRazorpayPaymentFailed(paymentData: any) {
    try {
      await prisma.payment.updateMany({
        where: { razorpayOrderId: paymentData.order_id },
        data: { 
          status: 'failed',
          failureReason: paymentData.error_description || 'Payment failed'
        }
      });
    } catch (error) {
      console.error('Handle Razorpay payment failed error:', error);
    }
  }

  private static async completePayment(paymentId: string, transactionId: string) {
    try {
      await prisma.$transaction(async (tx) => {
        // Update payment status
        const payment = await tx.payment.update({
          where: { id: paymentId },
          data: { 
            status: 'completed',
            completedAt: new Date(),
            transactionId
          }
        });

        // Create course enrollment
        await tx.courseEnrollment.create({
          data: {
            userId: payment.userId,
            courseId: payment.courseId
          }
        });

        // Create progress entry
        await tx.progress.create({
          data: {
            userId: payment.userId,
            courseId: payment.courseId,
            progressPercentage: 0,
            timeSpent: 0,
            isCompleted: false
          }
        });

        // Update course enrollment count
        await tx.course.update({
          where: { id: payment.courseId },
          data: {
            totalStudents: { increment: 1 }
          }
        });

        // Award enrollment points to user
        await tx.user.update({
          where: { id: payment.userId },
          data: {
            points: { increment: 50 } // Enrollment bonus points
          }
        });
      });

      console.log(`Payment completed successfully: ${paymentId}`);
    } catch (error) {
      console.error('Complete payment error:', error);
      throw error;
    }
  }
}

import Razorpay from 'razorpay';
import { config } from '../config/env';
import prisma from '../config/database';

const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

export class PaymentService {
  async createOrder(amount: number, currency: string = 'INR') {
    try {
      const order = await razorpay.orders.create({
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        receipt: `receipt_${Date.now()}`,
      });

      return order;
    } catch (error) {
      console.error('Create order error:', error);
      throw new Error('Failed to create payment order');
    }
  }

  async verifyPayment(paymentData: any) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;
      
      // Verify signature
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', config.razorpay.keySecret);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const generated_signature = hmac.digest('hex');

      if (generated_signature === razorpay_signature) {
        return { success: true };
      } else {
        return { success: false, error: 'Invalid signature' };
      }
    } catch (error) {
      console.error('Verify payment error:', error);
      return { success: false, error: 'Payment verification failed' };
    }
  }

  async recordPayment(userId: string, paymentData: any) {
    try {
      return await prisma.payment.create({
        data: {
          userId,
          amount: paymentData.amount / 100, // Convert from paise to rupees
          currency: paymentData.currency,
          status: 'COMPLETED',
          paymentMethod: 'razorpay',
          transactionId: paymentData.razorpay_payment_id,
          metadata: paymentData,
        },
      });
    } catch (error) {
      console.error('Record payment error:', error);
      throw new Error('Failed to record payment');
    }
  }
}

export default new PaymentService();

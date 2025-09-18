import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const paymentInitiationSchema = Joi.object({
  courseId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().valid('usd', 'inr', 'eur', 'gbp').default('usd'),
  provider: Joi.string().valid('stripe', 'razorpay').default('stripe'),
  discountCode: Joi.string().optional()
});

export const validatePaymentInitiation = (req: Request, res: Response, next: NextFunction) => {
  const { error } = paymentInitiationSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details[0].message
    });
  }
  
  next();
};

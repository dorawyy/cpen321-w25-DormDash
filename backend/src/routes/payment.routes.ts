import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { paymentService } from '../services/payment.service';
import { CreatePaymentIntentRequest, ProcessPaymentRequest, createPaymentIntentSchema, processPaymentSchema } from '../types/payment.types';
import { validateBody } from '../middleware/validation.middleware';

const router = Router();
const paymentController = new PaymentController(paymentService);

router.post(
    '/create-intent',
    validateBody<CreatePaymentIntentRequest>(createPaymentIntentSchema),
    async (req, res, next) => await paymentController.createPaymentIntent(req, res, next)
);

router.post(
    '/process',
    validateBody<ProcessPaymentRequest>(processPaymentSchema),
    async (req, res, next) => await paymentController.processPayment(req, res, next)
);

router.get(
    '/status/:paymentIntentId',
    async (req: any, res, next) => await paymentController.getPaymentStatus(req, res, next)
);

export default router;
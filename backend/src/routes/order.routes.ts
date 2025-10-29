import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { orderService } from '../services/order.service';
import { QuoteRequest, quoteSchema } from '../types/order.types';
import { validateBody } from '../middleware/validation.middleware';


const router = Router();
const orderController = new OrderController(orderService);

router.post(
    '/quote',
    validateBody<QuoteRequest>(quoteSchema),
    async (req, res, next) => await orderController.getQuote(req, res, next)
);

router.post(
    '/',
    async (req, res, next) => await orderController.createOrder(req, res, next)
);

router.post(
    '/create-return-Job',
    // This endpoint uses the authenticated user (req.user) to create a return job
    async (req, res, next) => await orderController.createReturnJob(req, res, next)
);
router.get(
    '/all-orders',    // No need for studentId in URL since we get it from auth
    async (req, res, next) => await orderController.getAllOrders(req, res, next)
);

router.get(
    '/active-order',  // No need for studentId in URL since we get it from auth
    async (req, res, next) => await orderController.getActiveOrder(req, res, next)
);

router.delete('/cancel-order',
    async (req, res, next) => await orderController.cancelOrder(req, res, next)
);



export default router;


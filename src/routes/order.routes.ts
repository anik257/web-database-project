import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { protect, adminOnly, staffAccessible } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createOrderBodySchema,
  updateOrderBodySchema,
  idParamSchema,
} from '../utils/validation.schemas';

const router = Router();

// Apply auth protect to all order routes
router.use(protect);

router
  .route('/')
  .post(staffAccessible, validateRequest({ body: createOrderBodySchema }), orderController.create)
  .get(staffAccessible, orderController.getAll);

router
  .route('/:id')
  .get(staffAccessible, validateRequest({ params: idParamSchema }), orderController.getById)
  .put(staffAccessible, validateRequest({ params: idParamSchema, body: updateOrderBodySchema }), orderController.update)
  .delete(adminOnly, validateRequest({ params: idParamSchema }), orderController.remove);

export default router;

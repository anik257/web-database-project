import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { protect, adminOnly, staffAccessible } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth protect to all order routes
router.use(protect);

router
  .route('/')
  .post(staffAccessible, orderController.create)
  .get(staffAccessible, orderController.getAll);

router
  .route('/:id')
  .get(staffAccessible, orderController.getById)
  .put(staffAccessible, orderController.update)
  .delete(adminOnly, orderController.remove);

export default router;

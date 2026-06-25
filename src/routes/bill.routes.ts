import { Router } from 'express';
import * as billController from '../controllers/bill.controller';
import { protect, adminOnly, staffAccessible } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth protect to all bill routes
router.use(protect);

router
  .route('/')
  .post(staffAccessible, billController.create)
  .get(staffAccessible, billController.getAll);

router
  .route('/:id')
  .get(staffAccessible, billController.getById)
  .delete(adminOnly, billController.remove);

router.put('/:id/pay', staffAccessible, billController.pay);

export default router;

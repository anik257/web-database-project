import { Router } from 'express';
import * as billController from '../controllers/bill.controller';
import { protect, adminOnly, staffAccessible } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  generateBillBodySchema,
  payBillBodySchema,
  idParamSchema,
} from '../utils/validation.schemas';

const router = Router();

// Apply auth protect to all bill routes
router.use(protect);

router
  .route('/')
  .post(staffAccessible, validateRequest({ body: generateBillBodySchema }), billController.create)
  .get(staffAccessible, billController.getAll);

router
  .route('/:id')
  .get(staffAccessible, validateRequest({ params: idParamSchema }), billController.getById)
  .delete(adminOnly, validateRequest({ params: idParamSchema }), billController.remove);

router.put('/:id/pay', staffAccessible, validateRequest({ params: idParamSchema, body: payBillBodySchema }), billController.pay);

export default router;

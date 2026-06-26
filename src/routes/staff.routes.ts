import { Router } from 'express';
import * as staffController from '../controllers/staff.controller';
import { protect, adminOnly } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createStaffBodySchema,
  updateStaffBodySchema,
  idParamSchema,
} from '../utils/validation.schemas';

const router = Router();

// Apply auth protect and admin-only filter globally to all staff routes
router.use(protect, adminOnly);

router
  .route('/')
  .post(validateRequest({ body: createStaffBodySchema }), staffController.create)
  .get(staffController.getAll);

router
  .route('/:id')
  .get(validateRequest({ params: idParamSchema }), staffController.getById)
  .put(validateRequest({ params: idParamSchema, body: updateStaffBodySchema }), staffController.update)
  .delete(validateRequest({ params: idParamSchema }), staffController.remove);

export default router;

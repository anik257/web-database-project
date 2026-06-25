import { Router } from 'express';
import * as staffController from '../controllers/staff.controller';
import { protect, adminOnly } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth protect and admin-only filter globally to all staff routes
router.use(protect, adminOnly);

router
  .route('/')
  .post(staffController.create)
  .get(staffController.getAll);

router
  .route('/:id')
  .get(staffController.getById)
  .put(staffController.update)
  .delete(staffController.remove);

export default router;

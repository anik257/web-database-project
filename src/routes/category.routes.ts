import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { protect, adminOnly, staffAccessible } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth protect to all category routes
router.use(protect);

router
  .route('/')
  .post(adminOnly, categoryController.create)
  .get(staffAccessible, categoryController.getAll);

router
  .route('/:id')
  .get(staffAccessible, categoryController.getById)
  .put(adminOnly, categoryController.update)
  .delete(adminOnly, categoryController.remove);

export default router;

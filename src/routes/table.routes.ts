import { Router } from 'express';
import * as tableController from '../controllers/table.controller';
import { protect, adminOnly, staffAccessible } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth protect to all table routes
router.use(protect);

router
  .route('/')
  .post(adminOnly, tableController.create)
  .get(staffAccessible, tableController.getAll);

router
  .route('/:id')
  .get(staffAccessible, tableController.getById)
  .put(staffAccessible, tableController.update)
  .delete(adminOnly, tableController.remove);

export default router;

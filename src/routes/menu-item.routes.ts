import { Router } from 'express';
import * as menuItemController from '../controllers/menu-item.controller';
import { protect, adminOnly } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth protect to all menu-item routes
router.use(protect);

router
  .route('/')
  .post(adminOnly, menuItemController.create)
  .get(menuItemController.getAll);

router
  .route('/:id')
  .get(menuItemController.getById)
  .put(adminOnly, menuItemController.update)
  .delete(adminOnly, menuItemController.remove);

export default router;

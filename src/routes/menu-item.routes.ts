import { Router } from 'express';
import * as menuItemController from '../controllers/menu-item.controller';
import { protect, adminOnly } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createMenuItemBodySchema,
  updateMenuItemBodySchema,
  idParamSchema,
} from '../utils/validation.schemas';

const router = Router();

// Apply auth protect to all menu-item routes
router.use(protect);

router
  .route('/')
  .post(adminOnly, validateRequest({ body: createMenuItemBodySchema }), menuItemController.create)
  .get(menuItemController.getAll);

router
  .route('/:id')
  .get(validateRequest({ params: idParamSchema }), menuItemController.getById)
  .put(adminOnly, validateRequest({ params: idParamSchema, body: updateMenuItemBodySchema }), menuItemController.update)
  .delete(adminOnly, validateRequest({ params: idParamSchema }), menuItemController.remove);

export default router;

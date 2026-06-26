import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { protect, adminOnly, staffAccessible } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createCategoryBodySchema,
  updateCategoryBodySchema,
  idParamSchema,
} from '../utils/validation.schemas';

const router = Router();

// Apply auth protect to all category routes
router.use(protect);

router
  .route('/')
  .post(adminOnly, validateRequest({ body: createCategoryBodySchema }), categoryController.create)
  .get(staffAccessible, categoryController.getAll);

router
  .route('/:id')
  .get(staffAccessible, validateRequest({ params: idParamSchema }), categoryController.getById)
  .put(adminOnly, validateRequest({ params: idParamSchema, body: updateCategoryBodySchema }), categoryController.update)
  .delete(adminOnly, validateRequest({ params: idParamSchema }), categoryController.remove);

export default router;

import { Router } from 'express';
import * as tableController from '../controllers/table.controller';
import { protect, adminOnly, staffAccessible } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createTableBodySchema,
  updateTableBodySchema,
  idParamSchema,
} from '../utils/validation.schemas';

const router = Router();

// Apply auth protect to all table routes
router.use(protect);

router
  .route('/')
  .post(adminOnly, validateRequest({ body: createTableBodySchema }), tableController.create)
  .get(staffAccessible, tableController.getAll);

router
  .route('/:id')
  .get(staffAccessible, validateRequest({ params: idParamSchema }), tableController.getById)
  .put(staffAccessible, validateRequest({ params: idParamSchema, body: updateTableBodySchema }), tableController.update)
  .delete(adminOnly, validateRequest({ params: idParamSchema }), tableController.remove);

export default router;

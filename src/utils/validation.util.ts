import mongoose from 'mongoose';
import { ApiError } from './api-error';

/**
 * Validates if a given string is a valid MongoDB ObjectId.
 * Throws a 400 Bad Request ApiError if validation fails.
 *
 * @param id The string ID to validate.
 * @param entityName The name of the entity (e.g. 'Category', 'Order') for a clearer error message.
 */
export const validateObjectId = (id: string, entityName: string = 'Resource'): void => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest(`Invalid ${entityName} ID format: '${id}'`);
  }
};

import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async Express request handler to catch any errors and forward them to 'next'.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

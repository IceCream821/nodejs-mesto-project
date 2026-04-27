/* eslint-disable no-unused-vars -- имена в типе сигнатуры колбэка */
import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';

export default function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

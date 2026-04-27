import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { UnauthorizedError } from '../errors/httpErrors';

export default function auth(req: Request, res: Response, next: NextFunction) {
  const bearer = 'Bearer ';
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith(bearer)) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  const token = authorization.slice(bearer.length);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & { _id?: string };
    if (!payload._id) {
      return next(new UnauthorizedError('Необходима авторизация'));
    }
    req.user = { _id: String(payload._id) };
    return next();
  } catch {
    return next(new UnauthorizedError('Необходима авторизация'));
  }
}

import { ErrorRequestHandler } from 'express';
import { isCelebrateError } from 'celebrate';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { HttpError } from '../errors/httpErrors';

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err
    && (err as { code: number }).code === 11000;
}

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  if (err instanceof HttpError) {
    return res.status(err.statusCode).send({ message: err.message });
  }
  if (isCelebrateError(err)) {
    return res.status(400).send({ message: 'Переданы некорректные данные' });
  }
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).send({ message: 'Переданы некорректные данные' });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).send({ message: 'Передан некорректный id' });
  }
  if (isDuplicateKeyError(err)) {
    return res.status(409).send({ message: 'Пользователь с указанным email уже зарегистрирован' });
  }
  if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
    return res.status(401).send({ message: 'Необходима авторизация' });
  }
  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).send({ message: 'Внутренняя ошибка сервера' });
};

export default errorHandler;

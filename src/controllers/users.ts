import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import {
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from '../errors/httpErrors';
import User from '../models/user';
import asyncHandler from '../utils/asyncHandler';

export const getUsers = asyncHandler(
  // eslint-disable-next-line no-unused-vars
  async (_req: Request, res: Response, _next: NextFunction) => {
    const users = await User.find({});
    res.send(users);
  },
);

export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new NotFoundError('Пользователь с указанным _id не найден'));
    }
    return res.send(user);
  },
);

export const getUserById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return next(new NotFoundError('Пользователь по указанному _id не найден'));
    }
    return res.send(user);
  },
);

export const createUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      email, password, name, about, avatar,
    } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await User.create({
      email,
      password: hash,
      ...(name !== undefined && name !== null && { name }),
      ...(about !== undefined && about !== null && { about }),
      ...(avatar !== undefined && avatar !== null && { avatar }),
    });
    const user = await User.findOne({ email });
    if (!user) {
      return next(new InternalServerError());
    }
    return res.status(201).send(user);
  },
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user?.password) {
      return next(new UnauthorizedError('Неправильная почта или пароль'));
    }
    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return next(new UnauthorizedError('Неправильная почта или пароль'));
    }
    const token = jwt.sign(
      { _id: user._id.toString() },
      JWT_SECRET,
      { expiresIn: '7d' },
    );
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
    res.cookie('jwt', token, {
      maxAge: maxAgeMs,
      httpOnly: true,
      sameSite: 'lax',
    });
    return res.send({ token });
  },
);

export const updateProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, about } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true },
    );
    if (!user) {
      return next(new NotFoundError('Пользователь с указанным _id не найден'));
    }
    return res.send(user);
  },
);

export const updateAvatar = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
    );
    if (!user) {
      return next(new NotFoundError('Пользователь с указанным _id не найден'));
    }
    return res.send(user);
  },
);

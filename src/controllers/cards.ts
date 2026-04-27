import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Card from '../models/card';
import { ForbiddenError, NotFoundError } from '../errors/httpErrors';
import asyncHandler from '../utils/asyncHandler';

function getCardOwnerId(owner: unknown): string {
  if (owner instanceof mongoose.Types.ObjectId) {
    return owner.toString();
  }
  if (typeof owner === 'object' && owner !== null && '_id' in owner) {
    return String((owner as { _id: mongoose.Types.ObjectId })._id);
  }
  return String(owner);
}

export const getCards = asyncHandler(
  // eslint-disable-next-line no-unused-vars
  async (_req: Request, res: Response, _next: NextFunction) => {
    const cards = await Card.find({}).populate(['owner', 'likes']);
    res.send(cards);
  },
);

export const createCard = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, link } = req.body;
    const created = await Card.create({
      name,
      link,
      owner: req.user._id,
    });
    const card = await Card.findById(created._id).populate(['owner', 'likes']);
    if (!card) {
      return next(new NotFoundError('Карточка с указанным _id не найдена'));
    }
    return res.status(201).send(card);
  },
);

export const deleteCard = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { cardId } = req.params;
    const card = await Card.findById(cardId).populate(['owner', 'likes']);
    if (!card) {
      return next(new NotFoundError('Карточка с указанным _id не найдена'));
    }
    const ownerId = getCardOwnerId(card.owner);
    if (ownerId !== req.user._id) {
      return next(new ForbiddenError('Нет прав на удаление этой карточки'));
    }
    await card.deleteOne();
    return res.send(card);
  },
);

export const likeCard = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { cardId } = req.params;
    const card = await Card.findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    ).populate(['owner', 'likes']);
    if (!card) {
      return next(new NotFoundError('Передан несуществующий _id карточки'));
    }
    return res.send(card);
  },
);

export const dislikeCard = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { cardId } = req.params;
    const card = await Card.findByIdAndUpdate(
      cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    ).populate(['owner', 'likes']);
    if (!card) {
      return next(new NotFoundError('Передан несуществующий _id карточки'));
    }
    return res.send(card);
  },
);

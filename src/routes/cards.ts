import { Router } from 'express';
import {
  createCard,
  deleteCard,
  dislikeCard,
  getCards,
  likeCard,
} from '../controllers/cards';
import {
  cardIdParamCelebrate,
  createCardCelebrate,
} from '../validators/schemas';

const router = Router();

router.get('/', getCards);
router.post('/', createCardCelebrate, createCard);
router.put('/likes/:cardId', cardIdParamCelebrate, likeCard);
router.delete('/likes/:cardId', cardIdParamCelebrate, dislikeCard);
router.put('/:cardId/likes', cardIdParamCelebrate, likeCard);
router.delete('/:cardId/likes', cardIdParamCelebrate, dislikeCard);
router.delete('/:cardId', cardIdParamCelebrate, deleteCard);

export default router;

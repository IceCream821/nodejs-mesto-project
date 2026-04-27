import { celebrate, Joi, Segments } from 'celebrate';
import urlRegex from '../constants/urlRegex';

const objectId = Joi.string().hex().length(24).required();

export const signupCelebrate = celebrate({
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().trim().min(2).max(30),
    about: Joi.string().trim().min(2).max(200),
    avatar: Joi.string().regex(urlRegex),
  }),
});

export const signinCelebrate = celebrate({
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),
});

export const userIdParamCelebrate = celebrate({
  [Segments.PARAMS]: Joi.object({
    userId: objectId,
  }),
});

export const updateProfileCelebrate = celebrate({
  [Segments.BODY]: Joi.object({
    name: Joi.string().trim().min(2).max(30),
    about: Joi.string().trim().min(2).max(200),
  }).or('name', 'about'),
});

export const updateAvatarCelebrate = celebrate({
  [Segments.BODY]: Joi.object({
    avatar: Joi.string()
      .regex(urlRegex)
      .required(),
  }),
});

export const createCardCelebrate = celebrate({
  [Segments.BODY]: Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(30)
      .required(),
    link: Joi.string()
      .regex(urlRegex)
      .required(),
  }),
});

export const cardIdParamCelebrate = celebrate({
  [Segments.PARAMS]: Joi.object({
    cardId: objectId,
  }),
});

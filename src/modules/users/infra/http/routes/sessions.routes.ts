import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';

import AuthenticationController from '../controllers/AuthenticationController';

const sessionsRouter = Router();
const authenticationController = new AuthenticationController();

sessionsRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      cpf: Joi.string().required(),
      password: Joi.string().required(),
    },
  }),
  authenticationController.create,
);

export default sessionsRouter;

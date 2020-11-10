import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';

import ensureAuthenticated from '@modules/users/infra/http/middlewares/ensureAuthenticated';
import TransactionRegistrationController from '../controllers/TransactionRegistrationController';

const transactionsRouter = Router();
const transactionRegistrationController = new TransactionRegistrationController();

transactionsRouter.use(ensureAuthenticated);

transactionsRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      from_account_id: Joi.string().required(),
      to_account_id: Joi.string().required(),
      type: Joi.string().required(),
      value: Joi.number().required(),
      bonusValue: Joi.number().required(),
      transactionCost: Joi.number().required(),
    },
  }),
  transactionRegistrationController.create,
);

export default transactionsRouter;

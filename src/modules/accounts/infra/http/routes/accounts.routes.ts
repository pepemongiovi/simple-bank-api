import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';

import ensureAuthenticated from '@modules/users/infra/http/middlewares/ensureAuthenticated';

import AccountRegistrationController from '../controllers/AccountRegistrationController';
import AccountUpdateBalanceController from '../controllers/AccountUpdateBalanceController';
import AccountFindByIdController from '../controllers/AccountFindByIdController';
import AccountDeletionController from '../controllers/AccountDeletionController';

const accountsRouter = Router();
const accountRegistrationController = new AccountRegistrationController();
const accountUpdateBalanceController = new AccountUpdateBalanceController();
const accountFindByIdController = new AccountFindByIdController();
const accountDeletionController = new AccountDeletionController();

accountsRouter.use(ensureAuthenticated);

accountsRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      user_id: Joi.string().required(),
      bank_id: Joi.string().required(),
    },
  }),
  accountRegistrationController.create,
);

accountsRouter.put(
  '/:id/balance',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().uuid().required(),
    },
    [Segments.BODY]: {
      balance: Joi.number().required(),
    },
  }),
  accountUpdateBalanceController.update,
);

accountsRouter.get(
  '/:id',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().uuid().required(),
    },
  }),
  accountFindByIdController.get,
);

accountsRouter.delete(
  '/:id',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().uuid().required(),
    },
  }),
  accountDeletionController.delete,
);

export default accountsRouter;

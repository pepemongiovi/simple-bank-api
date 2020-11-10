import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';

import ensureAuthenticated from '@modules/users/infra/http/middlewares/ensureAuthenticated';

import BankRegistrationController from '../controllers/BankRegistrationController';
import BankTransferController from '../controllers/BankTransferController';
import BankWithdrawController from '../controllers/BankWithdrawController';
import BankDepositController from '../controllers/BankDepositController';
import BankFindByIdController from '../controllers/BankFindByIdController';
import BankDeletionController from '../controllers/BankDeletionController';
import BankUpdateController from '../controllers/BankUpdateController';
import BankTransactionHistoryController from '../controllers/BankTransactionHistoryController';

const banksRouter = Router();

const bankRegistrationController = new BankRegistrationController();
const bankDepositController = new BankDepositController();
const bankTransferController = new BankTransferController();
const bankWithdrawController = new BankWithdrawController();
const bankFindByIdController = new BankFindByIdController();
const bankUpdateController = new BankUpdateController();
const bankDeletionController = new BankDeletionController();
const bankTransactionHistoryController = new BankTransactionHistoryController();

banksRouter.use(ensureAuthenticated);

banksRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      cnpj: Joi.string().required(),
    },
  }),
  bankRegistrationController.create,
);

banksRouter.post(
  '/deposit',
  celebrate({
    [Segments.BODY]: {
      account_id: Joi.string().uuid().required(),
      value: Joi.number().required(),
    },
  }),
  bankDepositController.deposit,
);

banksRouter.post(
  '/withdraw',
  celebrate({
    [Segments.BODY]: {
      account_id: Joi.string().uuid().required(),
      value: Joi.number().required(),
    },
  }),
  bankWithdrawController.withdraw,
);

banksRouter.post(
  '/transfer',
  celebrate({
    [Segments.BODY]: {
      from_account_id: Joi.string().uuid().required(),
      to_account_id: Joi.string().uuid().required(),
      value: Joi.number().required(),
    },
  }),
  bankTransferController.transfer,
);

banksRouter.get(
  '/:id',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().uuid().required(),
    },
  }),
  bankFindByIdController.getById,
);

banksRouter.put(
  '/',
  celebrate({
    [Segments.BODY]: {
      bank: Joi.required(),
    },
  }),
  bankUpdateController.update,
);

banksRouter.delete(
  '/:id',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().uuid().required(),
    },
  }),
  bankDeletionController.delete,
);

banksRouter.post(
  '/transactions',
  celebrate({
    [Segments.BODY]: {
      account_id: Joi.string().uuid().required(),
      from_date: Joi.date().required(),
      to_date: Joi.date().required(),
    },
  }),
  bankTransactionHistoryController.getHistory,
);

export default banksRouter;

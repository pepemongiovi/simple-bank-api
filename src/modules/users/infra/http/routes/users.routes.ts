import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';

import UserRegistrationController from '../controllers/UserRegistrationController';
import UserFindByIdController from '../controllers/UserFindByIdController';
import UserUpdateController from '../controllers/UserUpdateController';
import UserDeletionController from '../controllers/UserDeletionController';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const usersRouter = Router();
const userRegistrationController = new UserRegistrationController();
const userFindByIdController = new UserFindByIdController();
const userUpdateController = new UserUpdateController();
const userDeletionController = new UserDeletionController();

// Public routes
usersRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      cpf: Joi.string().required(),
      password: Joi.string().required(),
    },
  }),
  userRegistrationController.create,
);

// Private routes
usersRouter.use(ensureAuthenticated);

usersRouter.get(
  '/:id',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().uuid().required(),
    },
  }),
  userFindByIdController.getById,
);

usersRouter.put(
  '/',
  celebrate({
    [Segments.BODY]: {
      user: Joi.required(),
    },
  }),
  userUpdateController.update,
);

usersRouter.delete(
  '/:id',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().uuid().required(),
    },
  }),
  userDeletionController.delete,
);

export default usersRouter;

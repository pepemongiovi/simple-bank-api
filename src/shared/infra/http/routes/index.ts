import { Router } from 'express';
import usersRouter from '@modules/users/infra/http/routes/users.routes';
import sessionsRouter from '@modules/users/infra/http/routes/sessions.routes';
import banksRouter from '@modules/banks/infra/http/routes/banks.routes';
import accountsRouter from '@modules/accounts/infra/http/routes/accounts.routes';
import transactionsRouter from '@modules/transactions/infra/http/routes/transactions.routes';

const routes = Router();

routes.use('/users', usersRouter);
routes.use('/sessions', sessionsRouter);
routes.use('/banks', banksRouter);
routes.use('/accounts', accountsRouter);
routes.use('/transactions', transactionsRouter);

export default routes;

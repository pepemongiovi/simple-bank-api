import { container } from 'tsyringe';

import '@modules/users/providers';

import IUsersRepository from '@modules/users/repositories/IUsersRepository';
import UsersRepository from '@modules/users/infra/typeorm/repositories/UsersRepository';

import IUserTokensRepository from '@modules/users/repositories/IUserTokensRepository';
import UserTokensRepository from '@modules/users/infra/typeorm/repositories/UserTokensRepository';

import IBanksRepository from '@modules/banks/repositories/IBanksRepository';
import BanksRepository from '@modules/banks/infra/typeorm/repositories/BanksRepository';

import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import AccountsRepository from '@modules/accounts/infra/typeorm/repositories/AccountsRepository';

import ITransactionsRepository from '@modules/transactions/repositories/ITransactionsRepository';
import TransactionsRepository from '@modules/transactions/infra/typeorm/repositories/TransactionsRepository';

container.registerSingleton<IUsersRepository>(
  'UsersRepository',
  UsersRepository,
);

container.registerSingleton<IUserTokensRepository>(
  'UserTokensRepository',
  UserTokensRepository,
);

container.registerSingleton<IBanksRepository>(
  'BanksRepository',
  BanksRepository,
);

container.registerSingleton<IAccountsRepository>(
  'AccountsRepository',
  AccountsRepository,
);

container.registerSingleton<ITransactionsRepository>(
  'TransactionsRepository',
  TransactionsRepository,
);

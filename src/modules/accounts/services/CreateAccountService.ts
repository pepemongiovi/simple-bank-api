import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IAccountsRepository from '../repositories/IAccountsRepository';

import Account from '../infra/typeorm/entities/Account';
import IBanksRepository from '@modules/banks/repositories/IBanksRepository';
import IUsersRepository from '@modules/users/repositories/IUsersRepository';
import AccountsRepository from '../infra/typeorm/repositories/AccountsRepository';
import accountsRouter from '../infra/http/routes/accounts.routes';
import GetUserByIdService from '@modules/users/services/GetUserByIdService';
import GetBankByIdService from '@modules/banks/services/GetBankByIdService';
import UsersRepository from '@modules/users/infra/typeorm/repositories/UsersRepository';
import BanksRepository from '@modules/banks/infra/typeorm/repositories/BanksRepository';

interface IRequest {
  user_id: string;
  bank_id: string;
}

let accountsRepository: AccountsRepository
let usersRepository: UsersRepository
let banksRepository: BanksRepository

@injectable()
class CreateAccountService {
  constructor() {
    usersRepository = new UsersRepository()
    banksRepository = new BanksRepository()
    accountsRepository = new AccountsRepository()
  }

  async execute({ user_id, bank_id }: IRequest): Promise<Account> {
    const isUserIdValid = await usersRepository.findById(user_id);
    const isBankIdValid = await banksRepository.findById(bank_id);
    const userHasAccount = await accountsRepository.findByUserId(user_id);

    if(!isUserIdValid) {
      throw new AppError('No user found for given user id.', 404);
    }
    else if(!isBankIdValid) {
      throw new AppError('No bank found for given bank id.', 404);
    }
    else if(userHasAccount) {
      throw new AppError('Only one account per user permitted.', 403);
    }

    const initialBalance = 0;

    const account = await accountsRepository.create({
      user_id,
      bank_id,
      balance: initialBalance
    });

    return account;
  }
}

export default CreateAccountService;

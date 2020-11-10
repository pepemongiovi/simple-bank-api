import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IAccountsRepository from '../repositories/IAccountsRepository';

import Account from '../infra/typeorm/entities/Account';
import { getConnection, getRepository } from 'typeorm';
import AccountsRepository from '../infra/typeorm/repositories/AccountsRepository';

interface IRequest {
  account_id: string;
  balance: number;
}

let accountsRepository: AccountsRepository

@injectable()
class UpdateAccountBalanceService {
  constructor() {
    accountsRepository = new AccountsRepository()
  }

  async execute({ balance, account_id }: IRequest): Promise<Account> {
    const account = await accountsRepository.findById(account_id);

    if(!account) {
      throw new AppError('No account found for given id.', 404);
    }
    else if(balance < 0) {
      throw new AppError("New balance can't have a negative value.");
    }

    const updatedAccount = await accountsRepository.save({
      ...account,
      balance
    });

    return updatedAccount;
  }
}

export default UpdateAccountBalanceService;

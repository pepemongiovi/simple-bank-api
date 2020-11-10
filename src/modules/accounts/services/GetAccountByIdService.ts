import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IAccountsRepository from '../repositories/IAccountsRepository';

import Account from '../infra/typeorm/entities/Account';
import AccountsRepository from '../infra/typeorm/repositories/AccountsRepository';

interface IRequest {
  id: string;
}

let accountsRepository: AccountsRepository;

@injectable()
class GetAccountByIdService {
  constructor() {
    accountsRepository = new AccountsRepository()
  }

  async execute({ id  }: IRequest): Promise<Account> {
    const account = await accountsRepository.findById(id);

    if(!account) {
      throw new AppError('No account found for given id.', 404);
    }

    return account;
  }
}

export default GetAccountByIdService;

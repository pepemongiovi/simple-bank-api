import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IAccountsRepository from '../repositories/IAccountsRepository';import AccountsRepository from '../infra/typeorm/repositories/AccountsRepository';
;

interface IRequest {
  id: string;
}

let accountsRepository: AccountsRepository

@injectable()
class DeleteAccountService {
  constructor() {
    accountsRepository = new AccountsRepository()
  }

  async execute({ id }: IRequest): Promise<string> {
    const account = await accountsRepository.findById(id);

    if(!account) {
      throw new AppError('No account found with the given id.', 404);
    }

    const result = await accountsRepository.delete(id);

    return result;
  }
}

export default DeleteAccountService;

import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IAccountsRepository from '../repositories/IAccountsRepository';

import Account from '../infra/typeorm/entities/Account';

interface IRequest {
  id: string;
}

@injectable()
class GetAccountByIdService {
  constructor(
    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository
  ) {}

  async execute({ id  }: IRequest): Promise<Account> {
    const account = await this.accountsRepository.findById(id);

    if(!account) {
      throw new AppError('No account found for given id.', 404);
    }

    return account;
  }
}

export default GetAccountByIdService;

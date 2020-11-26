import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import Account from '../infra/typeorm/entities/Account';
import IAccountsRepository from '../repositories/IAccountsRepository';

interface IRequest {
  id: string;
}
@injectable()
class GetAccountByIdService {
  constructor(
    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository
  ) {}

  async execute({ id }: IRequest): Promise<Account> {
    const account = await this.accountsRepository.findById(id);

    if (!account) {
      throw new AppError('No account found for given id.', 404);
    }

    return account;
  }
}

export default GetAccountByIdService;

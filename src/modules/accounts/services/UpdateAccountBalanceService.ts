import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import Account from '../infra/typeorm/entities/Account';
import IAccountsRepository from '../repositories/IAccountsRepository';

interface IRequest {
  account_id: string;
  balance: number;
}
@injectable()
class UpdateAccountBalanceService {
  constructor(
    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository
  ) {}

  async execute({ balance, account_id }: IRequest): Promise<Account> {
    const account = await this.accountsRepository.findById(account_id);

    if (!account) {
      throw new AppError('No account found for given id.', 404);
    } else if (balance < 0) {
      throw new AppError("New balance can't have a negative value.");
    }

    const updatedAccount = await this.accountsRepository.save({
      ...account,
      balance,
    });

    return updatedAccount;
  }
}

export default UpdateAccountBalanceService;

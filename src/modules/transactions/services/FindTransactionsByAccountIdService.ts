import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import Transaction from '../infra/typeorm/entities/Transaction';
import ITransactionsRepository from '../repositories/ITransactionsRepository';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';

interface IRequest {
  account_id: string;
}

@injectable()
class FindTransactionsByAccountIdService {
  constructor(
    @inject('TransactionsRepository')
    private transactionsRepository: ITransactionsRepository,
    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository
  ) {}

  async execute({ account_id }: IRequest): Promise<Transaction[]> {
    const account = await this.accountsRepository.findById(account_id);

    if (!account) {
      throw new AppError('No account found for given account id.', 404);
    }

    const transactions = await this.transactionsRepository.findByAccountId(
      account_id,
    );

    return transactions;
  }
}

export default FindTransactionsByAccountIdService;

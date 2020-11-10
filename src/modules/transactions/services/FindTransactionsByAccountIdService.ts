import { injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import AccountsRepository from '@modules/accounts/infra/typeorm/repositories/AccountsRepository';
import Transaction from '../infra/typeorm/entities/Transaction';
import TransactionsRepository from '../infra/typeorm/repositories/TransactionsRepository';

interface IRequest {
  account_id: string;
}

let transactionsRepository: TransactionsRepository;
let accountsRepository: AccountsRepository;

@injectable()
class FindTransactionsByAccountIdService {
  constructor() {
    accountsRepository = new AccountsRepository();
    transactionsRepository = new TransactionsRepository();
  }

  async execute({ account_id }: IRequest): Promise<Transaction[]> {
    const account = await accountsRepository.findById(account_id);

    if (!account) {
      throw new AppError('No account found for given account id.', 404);
    }

    const transactions = await transactionsRepository.findByAccountId(
      account_id,
    );

    return transactions;
  }
}

export default FindTransactionsByAccountIdService;

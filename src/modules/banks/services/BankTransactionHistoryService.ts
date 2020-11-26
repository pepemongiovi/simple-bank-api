import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import Transaction from '@modules/transactions/infra/typeorm/entities/Transaction';
import { isAfter, isBefore, isEqual } from 'date-fns';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import ITransactionsRepository from '@modules/transactions/repositories/ITransactionsRepository';

interface IRequest {
  account_id: string;
  from_date: Date;
  to_date: Date;
}

@injectable()
class BankTransactionHistoryService {
  constructor(
    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository,
    @inject('TransactionsRepository')
    private transactionsRepository: ITransactionsRepository,
  ) {}

  async execute({
    account_id,
    from_date,
    to_date,
  }: IRequest): Promise<Transaction[]> {
    const accountExists = await this.accountsRepository.findById(account_id);

    const isDateIntervalValid = isBefore(from_date, to_date);
    const isInitialDateValid = isBefore(from_date, new Date());

    if (!accountExists) {
      throw new AppError('No account found with the given id.', 404);
    } else if (!isDateIntervalValid) {
      throw new AppError(
        'Invalid interval. Initial date must be greater than final date.',
      );
    } else if (!isInitialDateValid) {
      throw new AppError('Initial date must not be greater than current date.');
    }

    const accountTransactions = await this.transactionsRepository.findByAccountId(
      account_id,
    );

    const transactionWithinInterval =
      accountTransactions?.filter(
        (t) =>
          !t.created_at ||
          ((isAfter(t.created_at, from_date) ||
            isEqual(t.created_at, from_date)) &&
            isBefore(t.created_at, to_date)),
      ) || [];

    return transactionWithinInterval;
  }
}

export default BankTransactionHistoryService;

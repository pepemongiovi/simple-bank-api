import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import Transaction, {
  TransactionType,
} from '../infra/typeorm/entities/Transaction';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import ITransactionsRepository from '../repositories/ITransactionsRepository';

interface IRequest {
  from_account_id: string;
  to_account_id: string;
  type: TransactionType;
  value: number;
  bonusValue: number;
  transactionCost: number;
}

@injectable()
class CreateTransactionService {
  constructor(
    @inject('TransactionsRepository')
    private transactionsRepository: ITransactionsRepository,
    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository
  ) {}

  async execute({
    from_account_id,
    to_account_id,
    type,
    value,
    bonusValue,
    transactionCost,
  }: IRequest): Promise<Transaction> {
    const isFromAccountIdValid = await this.accountsRepository.findById(
      from_account_id,
    );
    const isToAccountIdValid = await this.accountsRepository.findById(to_account_id);

    if (!isFromAccountIdValid) {
      throw new AppError('No account found for given from_account_id.', 404);
    } else if (!isToAccountIdValid) {
      throw new AppError('No account found for given to_account_id.', 404);
    } else if (value <= 0) {
      throw new AppError('Transaction value must be greater than zero.');
    } else if (bonusValue < 0) {
      throw new AppError('Transaction bonus value must not be negative.');
    } else if (transactionCost < 0) {
      throw new AppError('Transaction cost must be greater than zero.');
    }

    const transaction = await this.transactionsRepository.create({
      from_account_id,
      to_account_id,
      type,
      value,
      bonusValue,
      transactionCost,
    });

    return transaction;
  }
}

export default CreateTransactionService;

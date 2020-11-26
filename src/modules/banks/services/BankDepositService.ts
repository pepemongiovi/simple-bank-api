import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import Account from '@modules/accounts/infra/typeorm/entities/Account';
import Transaction, {
  TransactionType,
} from '@modules/transactions/infra/typeorm/entities/Transaction';
import { getManager } from 'typeorm';
import ITransactionsRepository from '@modules/transactions/repositories/ITransactionsRepository';

interface IRequest {
  account_id: string;
  value: number;
}

interface IRequestReturn {
  updatedAccount: Account;
  transaction: Transaction;
}

@injectable()
class BankDepositService {
  constructor(
    @inject('TransactionsRepository')
    private transactionsRepository: ITransactionsRepository,
  ) {}

  async execute({ account_id, value }: IRequest): Promise<IRequestReturn> {
    let updatedAccount: any;
    let bonusValue: any;

    await getManager().transaction(async (entityManager) => {
      const account = await entityManager.findOne(Account, account_id, {
        lock: { mode: 'pessimistic_write' },
      });

      const isValueValid = value > 0;

      if (!account) {
        throw new AppError('No account found with the given account_id.', 404);
      } else if (!isValueValid) {
        throw new AppError('Deposit value must be greater than zero.');
      }

      // eslint-disable-next-line radix
      const depositPercentageBonus: number = parseInt(
        process.env.DEPOSIT_PERCENTAGE_FOR_BONUS || '0.5',
      );
      bonusValue = value * (depositPercentageBonus / 100);
      const newAccountBalance = account.balance + value + bonusValue;

      account.balance = newAccountBalance;

      updatedAccount = await entityManager.save(account);
    });

    const transaction = await this.transactionsRepository.create({
      from_account_id: updatedAccount.id,
      to_account_id: updatedAccount.id,
      type: TransactionType.DEPOSIT,
      value,
      bonusValue,
      transactionCost: 0,
    });

    return {
      updatedAccount,
      transaction,
    };
  }
}

export default BankDepositService;

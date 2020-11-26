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
class BankWithdrawService {
  constructor(
    @inject('TransactionsRepository')
    private transactionsRepository: ITransactionsRepository,
  ) { }

  async execute({ account_id, value }: IRequest): Promise<IRequestReturn> {
    let updatedAccount: any;
    let transactionCost: any;

    await getManager().transaction(async (entityManager) => {
      const account = await entityManager.findOne(Account, account_id, {
        lock: { mode: 'pessimistic_write' },
      });

      if (!account) {
        throw new AppError('No account found with the given account_id.', 404);
      } else if (value <= 0) {
        throw new AppError('Withdraw value must be greater than zero.');
      }

      // eslint-disable-next-line radix
      const withdrawPercentageCost: number = parseInt(
        process.env.WITHDRAW_PERCENTAGE_COST || '1',
      );
      transactionCost = value * (withdrawPercentageCost / 100);
      const newAccountBalance = account.balance - value - transactionCost;

      if (newAccountBalance < 0) {
        throw new AppError(
          `Insufficient balance. The account's current balance is R$ ${account.balance.toFixed(
            2,
          )}. Remember a cost of 1% of the value withdrawn is charged.`,
        );
      }

      account.balance = newAccountBalance;

      updatedAccount = await entityManager.save(account);
    });

    const transaction = await this.transactionsRepository.create({
      from_account_id: updatedAccount.id,
      to_account_id: updatedAccount.id,
      type: TransactionType.WITHDRAW,
      value,
      bonusValue: 0,
      transactionCost,
    });

    return {
      updatedAccount,
      transaction,
    };
  }
}

export default BankWithdrawService;

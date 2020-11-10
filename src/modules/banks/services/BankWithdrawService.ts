import { injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import Account from '@modules/accounts/infra/typeorm/entities/Account';
import Transaction, {
  TransactionType,
} from '@modules/transactions/infra/typeorm/entities/Transaction';
import TransactionsRepository from '@modules/transactions/infra/typeorm/repositories/TransactionsRepository';
import { getManager } from 'typeorm';

interface IRequest {
  account_id: string;
  value: number;
}

interface IRequestReturn {
  updatedAccount: Account;
  transaction: Transaction;
}

let transactionsRepository: TransactionsRepository;

@injectable()
class BankWithdrawService {
  constructor() {
    transactionsRepository = new TransactionsRepository();
  }

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

      const withdrawPercentageCost = 1;
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

    const transaction = await transactionsRepository.create({
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

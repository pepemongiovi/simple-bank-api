import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import Account from '@modules/accounts/infra/typeorm/entities/Account';
import Transaction, {
  TransactionType,
} from '@modules/transactions/infra/typeorm/entities/Transaction';
import { getManager } from 'typeorm';
import ITransactionsRepository from '@modules/transactions/repositories/ITransactionsRepository';

interface IRequest {
  from_account_id: string;
  to_account_id: string;
  value: number;
}

interface IRequestReturn {
  updatedAccount: Account;
  transaction: Transaction;
}

@injectable()
class BankTransferService {
  constructor(
    @inject('TransactionsRepository')
    private transactionsRepository: ITransactionsRepository,
  ) { }

  async execute({
    from_account_id,
    to_account_id,
    value,
  }: IRequest): Promise<IRequestReturn> {
    let updatedFromAccount: any;

    await getManager().transaction(async (entityManager) => {
      const toAccountExists = await entityManager.findOne(
        Account,
        to_account_id,
      );
      const fromAccount = await entityManager.findOne(
        Account,
        from_account_id,
        {
          lock: { mode: 'pessimistic_write' },
        },
      );

      if (from_account_id === to_account_id) {
        throw new AppError('Cannnot make a transfer to you own account.');
      }
      if (!fromAccount) {
        throw new AppError('Cannot transfer from a nonexisting account.', 404);
      } else if (!toAccountExists) {
        throw new AppError('Cannot transfer to a nonexisting account.', 404);
      }

      const hasEnoughBalance = value <= fromAccount.balance;

      if (value <= 0) {
        throw new AppError('Transfer value must be greater than zero.');
      } else if (!hasEnoughBalance) {
        throw new AppError(
          `Insufficient balance. The account's current balance is R$ ${fromAccount.balance.toFixed(
            2,
          )}.`,
        );
      }

      fromAccount.balance -= value;

      updatedFromAccount = await entityManager.save(fromAccount);
    });

    await getManager().transaction(async (entityManager) => {
      const toAccount: any = await entityManager.findOne(
        Account,
        to_account_id,
        {
          lock: { mode: 'pessimistic_write' },
        },
      );

      toAccount.balance += value;

      await entityManager.save(toAccount);
    });

    const transaction = await this.transactionsRepository.create({
      from_account_id,
      to_account_id,
      type: TransactionType.TRANSFER,
      value,
      bonusValue: 0,
      transactionCost: 0,
    });

    return {
      updatedAccount: updatedFromAccount,
      transaction,
    };
  }
}

export default BankTransferService;

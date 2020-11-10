import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import Account from '@modules/accounts/infra/typeorm/entities/Account';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import ITransactionsRepository from '@modules/transactions/repositories/ITransactionsRepository';
import Transaction, { TransactionType } from '@modules/transactions/infra/typeorm/entities/Transaction';
import { EntityManager, getConnection, getManager, getRepository, TransactionRepository } from 'typeorm';
import { isRuningTests } from '@shared/helpers/helper';
import CreateTransactionService from '@modules/transactions/services/CreateTransactionService';
import TransactionsRepository from '@modules/transactions/infra/typeorm/repositories/TransactionsRepository';
import transactionsRouter from '@modules/transactions/infra/http/routes/transactions.routes';

interface IRequest {
  account_id: string;
  value: number;
}

interface IRequestReturn {
  updatedAccount: Account,
  transaction: Transaction
}

let transactionsRepository: TransactionsRepository

@injectable()
class BankDepositService {
  constructor() {
    transactionsRepository = new TransactionsRepository()
  }

  async execute({ account_id, value }: IRequest): Promise<IRequestReturn> {
    let updatedAccount: any;
    let bonusValue: any;

    await getManager().transaction(async entityManager => {
      let account = await entityManager.findOne(Account, account_id, {
        lock: { mode: 'pessimistic_write' }
      })

      const isValueValid = value > 0

      if(!account) {
        throw new AppError('No account found with the given account_id.', 404);
      }
      else if (!isValueValid) {
        throw new AppError('Deposit value must be greater than zero.');
      }

      const depositPercentageBonus = 0.5
      bonusValue = value * (depositPercentageBonus/100)
      const newAccountBalance = account.balance + value + bonusValue

      account.balance = newAccountBalance

      updatedAccount = await entityManager.save(account)
    })

    const transaction = await transactionsRepository.create({
      from_account_id: updatedAccount.id,
      to_account_id: updatedAccount.id,
      type: TransactionType.DEPOSIT,
      value: value,
      bonusValue: bonusValue,
      transactionCost: 0
    })

    return {
      updatedAccount,
      transaction
    };
  }
}

export default BankDepositService;

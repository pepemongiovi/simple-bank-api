import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import Account from '@modules/accounts/infra/typeorm/entities/Account';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import ITransactionsRepository from '@modules/transactions/repositories/ITransactionsRepository';
import Transaction, { TransactionType } from '@modules/transactions/infra/typeorm/entities/Transaction';

interface IRequest {
  account_id: string;
  value: number;
}

interface IRequestReturn {
  updatedAccount: Account,
  transaction: Transaction
}

@injectable()
class BankWithdrawService {
  constructor(
    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository,
    @inject('TransactionsRepository')
    private transactionsRepository: ITransactionsRepository
  ) {}

  async execute({ account_id, value }: IRequest): Promise<IRequestReturn> {
    const account = await this.accountsRepository.findById(account_id);

    if(!account) {
      throw new AppError('No account found with the given account_id.', 404);
    }
    else if(value <= 0) {
      throw new AppError('Withdraw value must be greater than zero.');
    }

    const withdrawPercentageCost = 1
    const withdrawCost = value * (withdrawPercentageCost/100)
    const newAccountBalance = account.balance - value - withdrawCost

    if(newAccountBalance < 0) {
      throw new AppError(
        `Insufficient balance. The account's current balance is R$ ${account.balance.toFixed(2)}. Remember a cost of 1% of the value withdrawn is charged.`
      );
    }

    const updatedAccount = await this.accountsRepository.save({
      ...account,
      balance: newAccountBalance
    })

    const transaction = await this.transactionsRepository.create({
      from_account_id: account.id,
      to_account_id: account.id,
      type: TransactionType.WITHDRAW,
      value: value,
      bonusValue: 0,
      transactionCost: withdrawCost
    })

    return {
      updatedAccount,
      transaction
    };
  }
}

export default BankWithdrawService;

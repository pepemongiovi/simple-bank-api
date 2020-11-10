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
class BankDepositService {
  constructor(
    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository,
    @inject('TransactionsRepository')
    private transactionsRepository: ITransactionsRepository
  ) {}

  async execute({ account_id, value }: IRequest): Promise<IRequestReturn> {
    const account = await this.accountsRepository.findById(account_id);
    const isValueValid = value > 0

    if(!account) {
      throw new AppError('No account found with the given account_id.', 404);
    }
    else if (!isValueValid) {
      throw new AppError('Deposit value must be greater than zero.');
    }

    const depositPercentageBonus = 0.5
    const bonusValue = value * (depositPercentageBonus/100)
    const newAccountBalance = account.balance + value + bonusValue

    const updatedAccount = await this.accountsRepository.save({
      ...account,
      balance: newAccountBalance
    })

    const transaction = await this.transactionsRepository.create({
      from_account_id: account.id,
      to_account_id: account.id,
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

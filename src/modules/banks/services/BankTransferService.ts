import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import Account from '@modules/accounts/infra/typeorm/entities/Account';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import Transaction, { TransactionType } from '@modules/transactions/infra/typeorm/entities/Transaction';
import ITransactionsRepository from '@modules/transactions/repositories/ITransactionsRepository';

interface IRequest {
  from_account_id: string;
  to_account_id: string;
  value: number;
}

interface IRequestReturn {
  updatedAccount: Account,
  transaction: Transaction
}

@injectable()
class BankTransferService {
  constructor(
    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository,
    @inject('TransactionsRepository')
    private transactionsRepository: ITransactionsRepository
  ) {}

  async execute({ from_account_id, to_account_id, value }: IRequest): Promise<IRequestReturn> {
    const fromAccount = await this.accountsRepository.findById(from_account_id);
    const toAccount = await this.accountsRepository.findById(to_account_id);

    if(from_account_id === to_account_id) {
      throw new AppError("Cannnot make a transfer to you own account.")
    }
    if(!fromAccount) {
      throw new AppError('Cannot transfer from a nonexisting account.', 404);
    }
    else if(!toAccount) {
      throw new AppError('Cannot transfer to a nonexisting account.', 404);
    }

    const hasEnoughBalance = value <= fromAccount.balance

    if(value <= 0) {
      throw new AppError('Transfer value must be greater than zero.');
    }
    else if(!hasEnoughBalance) {
      throw new AppError(
        `Insufficient balance. The account's current balance is R$ ${fromAccount.balance.toFixed(2)}.`
      );
    }

    await this.accountsRepository.save({
      ...toAccount,
      balance: toAccount.balance + value
    })

    const updatedFromAccount = await this.accountsRepository.save({
      ...fromAccount,
      balance: fromAccount.balance - value
    })

    const transaction = await this.transactionsRepository.create({
      from_account_id: from_account_id,
      to_account_id: to_account_id,
      type: TransactionType.TRANSFER,
      value: value,
      bonusValue: 0,
      transactionCost: 0
    })

    return {
      updatedAccount: updatedFromAccount,
      transaction
    }
  }
}

export default BankTransferService;

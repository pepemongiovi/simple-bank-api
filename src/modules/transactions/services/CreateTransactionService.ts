import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import ITransactionsRepository from '../repositories/ITransactionsRepository';

import Transaction, { TransactionType } from '../infra/typeorm/entities/Transaction';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import { getRepository } from 'typeorm';
import GetAccountByIdService from '@modules/accounts/services/GetAccountByIdService';
import TransactionsRepository from '../infra/typeorm/repositories/TransactionsRepository';
import AccountsRepository from '@modules/accounts/infra/typeorm/repositories/AccountsRepository';

interface IRequest {
  from_account_id: string;
  to_account_id: string;
  type: TransactionType;
  value: number;
  bonusValue: number;
  transactionCost: number;
}

let transactionsRepository: TransactionsRepository;
let accountsRepository: AccountsRepository;

@injectable()
class CreateTransactionService {
  constructor() {
    accountsRepository = new AccountsRepository()
    transactionsRepository = new TransactionsRepository()
  }

  async execute({ from_account_id, to_account_id, type, value, bonusValue, transactionCost }: IRequest): Promise<Transaction> {
    const isFromAccountIdValid = await accountsRepository.findById(from_account_id);
    const isToAccountIdValid = await accountsRepository.findById(to_account_id);

    if(!isFromAccountIdValid) {
      throw new AppError('No account found for given from_account_id.', 404);
    }
    else if(!isToAccountIdValid) {
      throw new AppError('No account found for given to_account_id.', 404);
    }
    else if(value <= 0){
      throw new AppError('Transaction value must be greater than zero.');
    }
    else if(bonusValue < 0){
      throw new AppError('Transaction bonus value must not be negative.');
    }
    else if(transactionCost < 0){
      throw new AppError('Transaction cost must be greater than zero.');
    }

    const transaction = await transactionsRepository.create({
      from_account_id,
      to_account_id,
      type,
      value,
      bonusValue,
      transactionCost
    });

    return transaction;
  }
}

export default CreateTransactionService;

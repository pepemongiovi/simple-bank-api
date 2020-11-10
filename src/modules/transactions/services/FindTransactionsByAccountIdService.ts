import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import ITransactionsRepository from '../repositories/ITransactionsRepository';

import Transaction, { TransactionType } from '../infra/typeorm/entities/Transaction';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import { getRepository } from 'typeorm';
import GetAccountByIdService from '@modules/accounts/services/GetAccountByIdService';
import TransactionsRepository from '../infra/typeorm/repositories/TransactionsRepository';
import transactionsRouter from '../infra/http/routes/transactions.routes';
import AccountsRepository from '@modules/accounts/infra/typeorm/repositories/AccountsRepository';

interface IRequest {
  account_id: string;
}

let transactionsRepository: TransactionsRepository;
let accountsRepository: AccountsRepository;

@injectable()
class FindTransactionsByAccountIdService {
  constructor() {
    accountsRepository = new AccountsRepository()
    transactionsRepository = new TransactionsRepository()
  }

  async execute({ account_id }: IRequest): Promise<Transaction[]> {
    const account = await accountsRepository.findById(account_id);

    if(!account) {
      throw new AppError('No account found for given account id.', 404);
    }

    return await transactionsRepository.findByAccountId(account_id)
  }
}

export default FindTransactionsByAccountIdService;

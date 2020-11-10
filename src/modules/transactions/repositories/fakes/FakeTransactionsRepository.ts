import { v4 } from 'uuid';

import ITransactionsRepository from '@modules/transactions/repositories/ITransactionsRepository';
import ICreateTransactionDTO from '@modules/transactions/dtos/ICreateTransactionDTO';

import Transaction from '../../infra/typeorm/entities/Transaction';

class FakeTransactionsRepository implements ITransactionsRepository {
  private transactions: Transaction[] = [];

  public async findById(id: string): Promise<Transaction | undefined> {
    const findTransaction = this.transactions.find((transaction) => transaction.id === id);

    return findTransaction;
  }

  public async findByAccountId(from_account_id: string): Promise<Transaction[]> {
    const findTransaction = this.transactions.filter(
      (transaction) => transaction.from_account_id === from_account_id
    );

    return findTransaction;
  }

  public async create(transactionData: ICreateTransactionDTO): Promise<Transaction> {
    const transaction = new Transaction();

    Object.assign(transaction, { id: v4() }, transactionData);

    this.transactions.push(transaction);

    return transaction;
  }

  public async save(transaction: Transaction): Promise<Transaction> {
    const findIndex = this.transactions.findIndex(
      (findTransaction) => findTransaction.id === transaction.id,
    );

    this.transactions[findIndex] = transaction;

    return transaction;
  }

  public async delete(id: string): Promise<any> {
    this.transactions = this.transactions.filter(transaction => transaction.id !== id)

    return "Transaction deleted!";
  }
}

export default FakeTransactionsRepository;

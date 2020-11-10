import { Repository, getRepository } from 'typeorm';

import ITransactionsRepository from '@modules/transactions/repositories/ITransactionsRepository';
import ICreateTransactionDTO from '@modules/transactions/dtos/ICreateTransactionDTO';

import Transaction from '../entities/Transaction';

class TransactionsRepository implements ITransactionsRepository {
  private ormRepository: Repository<Transaction>;

  constructor() {
    this.ormRepository = getRepository(Transaction);
  }

  public async findById(id: string): Promise<Transaction | undefined> {
    const transaction = await this.ormRepository.findOne(id);
    return transaction;
  }

  public async findByAccountId(
    from_account_id: string,
  ): Promise<Transaction[]> {
    const transaction = await this.ormRepository.find({
      where: { from_account_id },
    });
    return transaction;
  }

  public async create(
    transactionData: ICreateTransactionDTO,
  ): Promise<Transaction> {
    const transaction = this.ormRepository.create(transactionData);

    await this.ormRepository.save(transaction);

    return transaction;
  }

  public async save(transaction: Transaction): Promise<Transaction> {
    return this.ormRepository.save(transaction);
  }

  public async delete(id: string): Promise<string> {
    await this.ormRepository.delete(id);
    return 'Transaction deleted!';
  }
}

export default TransactionsRepository;

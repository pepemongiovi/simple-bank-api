import Transaction from '../infra/typeorm/entities/Transaction';
import ICreateTransactionDTO from '../dtos/ICreateTransactionDTO';

export default interface ITransactionsRepository {
  findById(id: string): Promise<Transaction | undefined>;
  findByAccountId(account_id: string): Promise<Transaction[]>;
  create(data: ICreateTransactionDTO): Promise<Transaction>;
  save(transaction: Transaction): Promise<Transaction>;
  delete(id: string): Promise<string>;
}

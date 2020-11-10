import { TransactionType } from '../infra/typeorm/entities/Transaction';

export default interface ICreateTransactionDTO {
  from_account_id: string;
  to_account_id: string;
  type: TransactionType;
  value: number;
  bonusValue: number;
  transactionCost: number;
}

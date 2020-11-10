import Account from '@modules/accounts/infra/typeorm/entities/Account';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

export enum TransactionType {
  DEPOSIT = 'deposit',
  TRANSFER = 'transfer',
  WITHDRAW = 'withdraw',
}

@Entity('transactions')
class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  from_account_id: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'from_account_id' })
  from_account: Account;

  @Column()
  to_account_id: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'to_account_id' })
  to_account: Account;

  @Column()
  type: TransactionType;

  @Column('float')
  value: number;

  @Column('float', { default: 0 })
  bonusValue: number;

  @Column('float', { default: 0 })
  transactionCost: number;

  @CreateDateColumn()
  created_at: Date;
}

export default Transaction;

import Bank from '@modules/banks/infra/typeorm/entities/Bank';
import Transaction from '@modules/transactions/infra/typeorm/entities/Transaction';
import User from '@modules/users/infra/typeorm/entities/User';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
  VersionColumn,
} from 'typeorm';

@Entity('accounts')
class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  bank_id: string;

  @OneToMany(() => Transaction, (transaction) => transaction.from_account)
  transactions: Transaction[];

  @ManyToOne(() => Bank)
  @JoinColumn({ name: 'bank_id' })
  bank: Bank;

  @Column('float', { default: 0 })
  balance: number;

  @VersionColumn() // A versioned entity!
  version: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Account;

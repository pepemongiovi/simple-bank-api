import Account from '@modules/accounts/infra/typeorm/entities/Account';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('banks')
class Bank {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Account, (account) => account.bank)
  accounts: Account[];

  @Column()
  name: string;

  @Column()
  cnpj: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Bank;

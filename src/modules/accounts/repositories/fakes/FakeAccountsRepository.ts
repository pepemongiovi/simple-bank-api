import { v4 } from 'uuid';

import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import ICreateAccountDTO from '@modules/accounts/dtos/ICreateAccountDTO';

import Account from '../../infra/typeorm/entities/Account';

class FakeAccountsRepository implements IAccountsRepository {
  private accounts: Account[] = [];

  public async findById(id: string): Promise<Account | undefined> {
    const findAccount = this.accounts.find((account) => account.id === id);

    return findAccount;
  }

  public async findByUserId(user_id: string): Promise<Account | undefined> {
    const findAccount = this.accounts.find((account) => account.user_id === user_id);

    return findAccount;
  }

  public async create(accountData: ICreateAccountDTO): Promise<Account> {
    const account = new Account();

    Object.assign(account, { id: v4() }, accountData);

    this.accounts.push(account);

    return account;
  }

  public async save(account: Account): Promise<Account> {
    const findIndex = this.accounts.findIndex(
      (findAccount) => findAccount.id === account.id,
    );

    this.accounts[findIndex] = account;

    return account;
  }

  public async delete(id: string): Promise<string> {
    this.accounts = this.accounts.filter(account => account.id !== id)

    return "Account deleted!";
  }
}

export default FakeAccountsRepository;

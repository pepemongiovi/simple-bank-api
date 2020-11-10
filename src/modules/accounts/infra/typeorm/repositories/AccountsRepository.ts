import { Repository, getRepository } from 'typeorm';
import IAccountsRepository from '@modules/accounts/repositories/IAccountsRepository';
import ICreateAccountDTO from '@modules/accounts/dtos/ICreateAccountDTO';
import Account from '../entities/Account';

class AccountsRepository implements IAccountsRepository {
  private ormRepository: Repository<Account>;

  constructor() {
    this.ormRepository = getRepository(Account);
  }

  public async findById(id: string): Promise<Account | undefined> {
    const account: any = await this.ormRepository.findOne(id, {
      relations: ['transactions'],
    });

    return account;
  }

  public async findByUserId(user_id: string): Promise<Account | undefined> {
    const options = {
      where: { user_id },
      relations: ['transactions'],
    };

    const account = await this.ormRepository.findOne(options);

    return account;
  }

  public async create(accountData: ICreateAccountDTO): Promise<Account> {
    const account = this.ormRepository.create(accountData);

    await this.ormRepository.save(account);

    return account;
  }

  public async save(account: Account): Promise<Account> {
    return this.ormRepository.save(account);
  }

  public async delete(id: string): Promise<string> {
    await this.ormRepository.delete(id);
    return 'Account deleted!';
  }
}

export default AccountsRepository;

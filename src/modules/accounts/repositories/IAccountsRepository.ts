import Account from '../infra/typeorm/entities/Account';
import ICreateAccountDTO from '../dtos/ICreateAccountDTO';

export default interface IAccountsRepository {
  findById(id: string): Promise<Account | undefined>;
  findByUserId(user_id: string): Promise<Account | undefined>;
  create(data: ICreateAccountDTO): Promise<Account>;
  save(account: Account): Promise<Account>;
  delete(id: string): Promise<string>;
}

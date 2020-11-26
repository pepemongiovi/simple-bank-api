import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import Account from '../infra/typeorm/entities/Account';
import IUsersRepository from '@modules/users/repositories/IUsersRepository';
import IBanksRepository from '@modules/banks/repositories/IBanksRepository';
import IAccountsRepository from '../repositories/IAccountsRepository';

interface IRequest {
  user_id: string;
  bank_id: string;
}
@injectable()
class CreateAccountService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
    @inject('BanksRepository')
    private banksRepository: IBanksRepository,
    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository
  ) {}

  async execute({ user_id, bank_id }: IRequest): Promise<Account> {
    const isUserIdValid = await this.usersRepository.findById(user_id);
    const isBankIdValid = await this.banksRepository.findById(bank_id);
    const userHasAccount = await this.accountsRepository.findByUserId(user_id);

    if (!isUserIdValid) {
      throw new AppError('No user found for given user id.', 404);
    } else if (!isBankIdValid) {
      throw new AppError('No bank found for given bank id.', 404);
    } else if (userHasAccount) {
      throw new AppError('Only one account per user permitted.', 403);
    }

    const initialBalance = 0;

    const account = await this.accountsRepository.create({
      user_id,
      bank_id,
      balance: initialBalance,
    });

    return account;
  }
}

export default CreateAccountService;

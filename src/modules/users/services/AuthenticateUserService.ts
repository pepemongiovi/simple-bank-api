import { sign } from 'jsonwebtoken';
import authConfig from '@config/auth';
import { injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import User from '../infra/typeorm/entities/User';
import UsersRepository from '../infra/typeorm/repositories/UsersRepository';
import BCryptHashProvider from '../providers/HashProvider/implementations/BCryptHashProvider';

interface IRequest {
  cpf: string;
  password: string;
}

interface IResponse {
  user: User;
  token: string;
}

let usersRepository: UsersRepository;
let hashProvider: BCryptHashProvider;

@injectable()
class AuthenticateUserService {
  constructor() {
    hashProvider = new BCryptHashProvider();
    usersRepository = new UsersRepository();
  }

  public async execute({ cpf, password }: IRequest): Promise<IResponse> {
    const user = await usersRepository.findByCPF(cpf);

    if (!user) {
      throw new AppError('No user was found with the given CPF.', 404);
    }

    const passwordMatched = await hashProvider.compareHash(
      password,
      user.password,
    );

    if (!passwordMatched) {
      throw new AppError('Incorrect password.', 401);
    }

    const { secret, expiresIn } = authConfig.jwt;
    const token = sign({}, secret, {
      subject: user.id,
      expiresIn,
    });

    return {
      user,
      token,
    };
  }
}

export default AuthenticateUserService;

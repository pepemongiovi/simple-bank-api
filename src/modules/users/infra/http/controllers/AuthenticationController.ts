// index, show, create, update,
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import AuthenticateUserService from '@modules/users/services/AuthenticateUserService';

export default class AuthenticationController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { cpf, password } = request.body;

    const authenticateUser = container.resolve(AuthenticateUserService);

    const { user, token } = await authenticateUser.execute({
      cpf,
      password,
    });

    return response.json({ user: classToClass(user), token });
  }
}

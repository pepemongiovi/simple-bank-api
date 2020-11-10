// index, show, create, update,
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import CreateUserService from '@modules/users/services/CreateUserService';

export default class UserRegistrationController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { name, cpf, password } = request.body;

    const createUser = container.resolve(CreateUserService);

    const user = await createUser.execute({
      name,
      cpf,
      password,
    });

    return response.json(classToClass(user));
  }
}

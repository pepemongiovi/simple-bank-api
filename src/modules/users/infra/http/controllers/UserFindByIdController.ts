// index, show, create, update,
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import GetUserByIdService from '@modules/users/services/GetUserByIdService';

export default class UserFindByIdController {
  public async getById(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { id } = request.params;

    const getUserById = container.resolve(GetUserByIdService);

    const user = await getUserById.execute({
      id,
    });

    return response.json(classToClass(user));
  }
}

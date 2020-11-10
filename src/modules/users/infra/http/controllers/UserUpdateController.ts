// index, show, create, update,
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import UpdateUserService from '@modules/users/services/UpdateUserService';

export default class UserUpdateController {
  public async update(request: Request, response: Response): Promise<Response> {
    const { user } = request.body;

    const updateUser = container.resolve(UpdateUserService);

    const updatedUser = await updateUser.execute({
      user,
    });

    return response.json(classToClass(updatedUser));
  }
}

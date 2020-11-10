// index, show, create, update,
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import DeleteUserService from '@modules/users/services/DeleteUserService';

export default class UserDeletionController {
  public async delete(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const deleteUser = container.resolve(DeleteUserService);

    const user = await deleteUser.execute({
      id,
    });

    return response.json(classToClass(user));
  }
}

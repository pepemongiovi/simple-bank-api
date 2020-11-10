import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import DeleteAccountService from '@modules/accounts/services/DeleteAccountService';

export default class AccountDeletionController {
  public async delete(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const deleteAccount = container.resolve(DeleteAccountService);

    const account = await deleteAccount.execute({
      id,
    });

    return response.json(classToClass(account));
  }
}

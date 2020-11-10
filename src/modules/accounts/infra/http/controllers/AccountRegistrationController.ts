import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import CreateAccountService from '@modules/accounts/services/CreateAccountService';

export default class AccountRegistrationController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { user_id, bank_id } = request.body;

    const createAccount = container.resolve(CreateAccountService);

    const account = await createAccount.execute({
      user_id,
      bank_id,
    });

    return response.json(classToClass(account));
  }
}

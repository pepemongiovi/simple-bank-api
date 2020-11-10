import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import GetAccountByIdService from '@modules/accounts/services/GetAccountByIdService';

export default class AccountFindByIdController {
  public async get(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const getAccountById = container.resolve(GetAccountByIdService);

    const account = await getAccountById.execute({ id });

    return response.json(classToClass(account));
  }
}

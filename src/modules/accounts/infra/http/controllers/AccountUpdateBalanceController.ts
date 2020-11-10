import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import UpdateAccountBalanceService from '@modules/accounts/services/UpdateAccountBalanceService';

export default class AccountUpdateBalanceController {
  public async update(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const { balance } = request.body;

    const updateAccountBalance = container.resolve(UpdateAccountBalanceService);

    const account = await updateAccountBalance.execute({
      account_id: id,
      balance,
    });

    return response.json(classToClass(account));
  }
}

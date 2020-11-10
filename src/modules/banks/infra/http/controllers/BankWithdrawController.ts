import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import BankWithdrawService from '@modules/banks/services/BankWithdrawService';

export default class BankWithdrawController {
  public async withdraw(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { account_id, value } = request.body;

    const bankWithdraw = container.resolve(BankWithdrawService);

    const updatedAccount = await bankWithdraw.execute({
      account_id,
      value,
    });

    return response.json(classToClass(updatedAccount));
  }
}

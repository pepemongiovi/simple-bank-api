import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import BankDepositService from '@modules/banks/services/BankDepositService';

export default class BankDepositController {
  public async deposit(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { account_id, value } = request.body;

    const bankDeposit = container.resolve(BankDepositService);

    const updatedAccount = await bankDeposit.execute({
      account_id,
      value,
    });

    return response.json(classToClass(updatedAccount));
  }
}

import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import BankTransferService from '@modules/banks/services/BankTransferService';

export default class BankTransferController {
  public async transfer(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { from_account_id, to_account_id, value } = request.body;

    const bankTransfer = container.resolve(BankTransferService);

    const updatedAccount = await bankTransfer.execute({
      from_account_id,
      to_account_id,
      value,
    });

    return response.json(classToClass(updatedAccount));
  }
}

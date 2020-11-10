/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import Account from '@modules/accounts/infra/typeorm/entities/Account';
import Bank from '@modules/banks/infra/typeorm/entities/Bank';
import { TransactionType } from '@modules/transactions/infra/typeorm/entities/Transaction';
import {
  clearDb,
  createAccountForTests,
  createBankForTests,
  createUserAndAuthenticateForTests,
  isTransactionEquals,
  makeDepositForTests,
  makeTransferForTests,
} from '@shared/helpers/helper';

const request = require('supertest');
const appServer = require('@shared/infra/http/server');

let bank: Bank;
let account: Account;
let otherAccount: Account;
let authToken = '';

describe('BankTransferRoute', () => {
  beforeEach(async () => {
    await clearDb();

    const { user, token } = await createUserAndAuthenticateForTests(
      request,
      appServer,
      'Giuseppe Mongiovi',
      '07346274407',
    );

    const otherUser = (
      await createUserAndAuthenticateForTests(
        request,
        appServer,
        'Jader Freitas',
        '034.037.960-00',
      )
    ).user;

    authToken = token;

    const newBankResponse = await createBankForTests(
      request,
      appServer,
      'Banco do Brasil',
      '00.000.000/0001-91',
      authToken,
    );

    bank = newBankResponse.body;

    const newAccountResponse = await createAccountForTests(
      request,
      appServer,
      user.id,
      bank.id,
      authToken,
    );

    account = newAccountResponse.body;

    const otherNewAccountResponse = await createAccountForTests(
      request,
      appServer,
      otherUser.id,
      bank.id,
      authToken,
    );

    otherAccount = otherNewAccountResponse.body;
  });

  it('should make a new transfer', async () => {
    const valueToBeDeposited = 500;

    const depositRes = await makeDepositForTests(
      request,
      appServer,
      valueToBeDeposited,
      account.id,
      authToken,
    );

    const valueToBeTransfered = 100;

    const transferRes = await makeTransferForTests(
      request,
      appServer,
      valueToBeTransfered,
      account.id,
      otherAccount.id,
      authToken,
    );

    const bonusValue = 0;
    const transactionCost = 0;

    const finalAccountBalance =
      depositRes.body.updatedAccount.balance - valueToBeTransfered;

    const expectedTransactionIsValid = isTransactionEquals(
      transferRes.body.transaction,
      account.id,
      otherAccount.id,
      TransactionType.TRANSFER,
      valueToBeTransfered,
      bonusValue,
      transactionCost,
    );

    expect(transferRes.statusCode).toEqual(200);
    expect(transferRes.body.transaction).toHaveProperty('id');
    expect(expectedTransactionIsValid).toBeTruthy();
    expect(transferRes.body.updatedAccount.balance).toBe(finalAccountBalance);
  });

  it('should not transfer without a authorization token.', async () => {
    const valueToBeDeposited = 500;

    await makeDepositForTests(
      request,
      appServer,
      valueToBeDeposited,
      account.id,
      authToken,
    );

    const valueToBeTransfered = 100;

    const transferRes = await makeTransferForTests(
      request,
      appServer,
      valueToBeTransfered,
      account.id,
      otherAccount.id,
    );

    expect(transferRes.statusCode).toEqual(401);
    expect(transferRes.body.message).toEqual('Invalid JWT token');
  });

  it('should not be able to transfer with an invalid account id.', async () => {
    const valueToBeTransfered = 100;
    const fakeAccountId = '05766d27-f634-45ea-ac82-eb53ae5d67fe';

    const invalidFromAccountIdTransferRes = await makeTransferForTests(
      request,
      appServer,
      valueToBeTransfered,
      fakeAccountId,
      account.id,
      authToken,
    );
    const invalidToAccountIdTransferRes = await makeTransferForTests(
      request,
      appServer,
      valueToBeTransfered,
      account.id,
      fakeAccountId,
      authToken,
    );

    expect(invalidFromAccountIdTransferRes.statusCode).toEqual(404);
    expect(invalidFromAccountIdTransferRes.body.message).toEqual(
      'Cannot transfer from a nonexisting account.',
    );

    expect(invalidToAccountIdTransferRes.statusCode).toEqual(404);
    expect(invalidToAccountIdTransferRes.body.message).toEqual(
      'Cannot transfer to a nonexisting account.',
    );
  });

  it('should not be able to transfer a value that is not greater than zero to an account.', async () => {
    const valueToBeTransfer = 0;
    const negativeValueToBeDeposited = -100;

    const valueZeroTransferRes = await makeTransferForTests(
      request,
      appServer,
      valueToBeTransfer,
      account.id,
      otherAccount.id,
      authToken,
    );

    const negativeTransferRes = await makeTransferForTests(
      request,
      appServer,
      negativeValueToBeDeposited,
      account.id,
      otherAccount.id,
      authToken,
    );

    expect(valueZeroTransferRes.statusCode).toEqual(400);
    expect(valueZeroTransferRes.body.message).toEqual(
      'Transfer value must be greater than zero.',
    );

    expect(negativeTransferRes.statusCode).toEqual(400);
    expect(negativeTransferRes.body.message).toEqual(
      'Transfer value must be greater than zero.',
    );
  });

  it('should not be able to transfer a value greater than the balance of who is transfering.', async () => {
    const valueToBeTransfer = 100;

    const valueZeroTransferRes = await makeTransferForTests(
      request,
      appServer,
      valueToBeTransfer,
      account.id,
      otherAccount.id,
      authToken,
    );

    expect(valueZeroTransferRes.statusCode).toEqual(400);
    expect(valueZeroTransferRes.body.message).toEqual(
      `Insufficient balance. The account's current balance is R$ ${account.balance.toFixed(
        2,
      )}.`,
    );
  });
});

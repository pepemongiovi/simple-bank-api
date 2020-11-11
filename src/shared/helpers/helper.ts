/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import Bank from '@modules/banks/infra/typeorm/entities/Bank';
import Transaction, {
  TransactionType,
} from '@modules/transactions/infra/typeorm/entities/Transaction';
import User from '@modules/users/infra/typeorm/entities/User';
import { getConnection } from 'typeorm';

export const isTransactionEquals = (
  transaction: Transaction,
  from_account_id: string,
  to_account_id: string,
  type: TransactionType,
  value: number,
  bonusValue: number,
  transactionCost: number,
) => {
  return (
    transaction.from_account_id === from_account_id &&
    transaction.to_account_id === to_account_id &&
    transaction.type === type &&
    transaction.value === value &&
    transaction.bonusValue === bonusValue &&
    transaction.transactionCost === transactionCost
  );
};

export const clearDb = async () => {
  const defaultConnection = getConnection(process.env.DEFAULT_CONNECTION);

  const entities = defaultConnection.entityMetadatas;

  for (const entity of entities) {
    const repository = await defaultConnection.getRepository(entity.name);
    await repository.query(`DELETE FROM ${entity.tableName};`);
  }
};

export const isRuningTests = () => {
  return (
    process.argv.filter((arg: string) => arg === '-runing-tests').length > 0
  );
};

export const createUserAndAuthenticateForTests = async (
  request: any,
  appServer: any,
  name: string,
  cpf: string,
) => {
  const user = await request(appServer).post('/users').send({
    name,
    cpf,
    password: '123456',
  });

  const { body } = await request(appServer).post('/sessions').send({
    cpf: user.body.cpf,
    password: '123456',
  });

  return body;
};

export const createAccountForTests = async (
  request: any,
  appServer: any,
  user_id: string,
  bank_id: string,
  authToken = '',
) => {
  const response = await request(appServer)
    .post('/accounts')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      user_id,
      bank_id,
    });

  return response;
};

export const createBankForTests = async (
  request: any,
  appServer: any,
  name: string,
  cnpj: string,
  authToken = '',
) => {
  const response = await request(appServer)
    .post('/banks')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      name,
      cnpj,
    });

  return response;
};

export const makeDepositForTests = async (
  request: any,
  appServer: any,
  value: number,
  account_id: string,
  authToken = '',
) => {
  const response = await request(appServer)
    .post('/banks/deposit')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      value,
      account_id,
    });

  return response;
};

export const getAccountByIdForTests = async (
  request: any,
  appServer: any,
  id: string,
  authToken = '',
) => {
  const response = await request(appServer)
    .get(`/accounts/${id}`)
    .set('Authorization', `Bearer ${authToken}`)
    .send();

  return response;
};

export const makeWithdrawForTests = async (
  request: any,
  appServer: any,
  value: number,
  account_id: string,
  authToken = '',
) => {
  const response = await request(appServer)
    .post('/banks/withdraw')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      value,
      account_id,
    });

  return response;
};

export const makeTransferForTests = async (
  request: any,
  appServer: any,
  value: number,
  from_account_id: string,
  to_account_id: string,
  authToken = '',
) => {
  const response = await request(appServer)
    .post('/banks/transfer')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      value,
      to_account_id,
      from_account_id,
    });

  return response;
};

export const deleteAccountForTests = async (
  request: any,
  appServer: any,
  id: string,
  token = '',
) => {
  const response = await request(appServer)
    .delete(`/accounts/${id}`)
    .set('Authorization', `Bearer ${token}`)
    .send();

  return response;
};

export const updateAccountBalanceForTests = async (
  request: any,
  appServer: any,
  account_id: string,
  balance: number,
  authToken = '',
) => {
  const response = await request(appServer)
    .put(`/accounts/${account_id}/balance`)
    .set('Authorization', `Bearer ${authToken}`)
    .send({ balance });

  return response;
};

export const getTransactionHistoryForTests = async (
  request: any,
  appServer: any,
  account_id: string,
  from_date: Date,
  to_date: Date,
  authToken = '',
) => {
  const response = await request(appServer)
    .post(`/banks/transactions`)
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      account_id,
      from_date,
      to_date,
    });

  return response;
};

export const deleteBankForTests = async (
  request: any,
  appServer: any,
  bank_id: string,
  authToken = '',
) => {
  const response = await request(appServer)
    .delete(`/banks/${bank_id}`)
    .set('Authorization', `Bearer ${authToken}`)
    .send();

  return response;
};

export const getBankByIdForTests = async (
  request: any,
  appServer: any,
  bank_id: string,
  authToken = '',
) => {
  const response = await request(appServer)
    .get(`/banks/${bank_id}`)
    .set('Authorization', `Bearer ${authToken}`)
    .send();

  return response;
};

export const updateBankForTests = async (
  request: any,
  appServer: any,
  bank: Bank,
  authToken = '',
) => {
  const response = await request(appServer)
    .put(`/banks`)
    .set('Authorization', `Bearer ${authToken}`)
    .send({ bank });

  return response;
};

export const createTransactionForTests = async (
  request: any,
  appServer: any,
  from_account_id: string,
  to_account_id: string,
  value: number,
  type: string,
  bonusValue: number,
  transactionCost: number,
  authToken = '',
) => {
  const response = await request(appServer)
    .post(`/transactions`)
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      from_account_id,
      to_account_id,
      value,
      type,
      bonusValue,
      transactionCost,
    });

  return response;
};

export const deleteUserForTests = async (
  request: any,
  appServer: any,
  user_id: string,
  authToken = '',
) => {
  const response = await request(appServer)
    .delete(`/users/${user_id}`)
    .set('Authorization', `Bearer ${authToken}`)
    .send();

  return response;
};

export const getUserByIdForTests = async (
  request: any,
  appServer: any,
  user_id: string,
  authToken = '',
) => {
  const response = await request(appServer)
    .get(`/users/${user_id}`)
    .set('Authorization', `Bearer ${authToken}`)
    .send();

  return response;
};

export const updateUserForTests = async (
  request: any,
  appServer: any,
  user: User,
  token = '',
) => {
  const response = await request(appServer)
    .put(`/users`)
    .set('Authorization', `Bearer ${token}`)
    .send({ user });

  return response;
};

export const createUserForTests = async (
  request: any,
  appServer: any,
  name: string,
  cpf: string,
  password: string,
) => {
  const response = await request(appServer)
    .post(`/users`)
    .send({ name, cpf, password });

  return response;
};

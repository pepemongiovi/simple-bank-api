import Account from "@modules/accounts/infra/typeorm/entities/Account";
import { clearDb, createAccountForTests, createBankForTests, createUserAndAuthenticateForTests, getAccountByIdForTests } from "@shared/helpers/helper";

const request = require('supertest')
const appServer = require('@shared/infra/http/server')

let account: Account;
let authToken = ""

describe('GeAccountByIdRoute', () => {
  beforeEach(async () => {
    await clearDb();

    const { user, token } = await createUserAndAuthenticateForTests(
      request, appServer, 'Giuseppe Mongiovi', '07346274407'
    );

    authToken = token

    const newBankRes = await createBankForTests(
      request, appServer, 'Banco do Brasil', '00.000.000/0001-91', authToken
    )

    const bank = newBankRes.body

    const newAccountRes = await createAccountForTests(
      request, appServer, user.id, bank.id, authToken
    )

    account = newAccountRes.body
  });

  it('should get a account by id.', async () => {
    const res = await getAccountByIdForTests(
      request, appServer, account.id, authToken
    )

    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject(account)
  })

  it('should not delete a account without authorization token.', async () => {
    const res = await getAccountByIdForTests(
      request, appServer, account.id
    )

    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Invalid JWT token')
  })

  it('should not be able to delete a account with invalid account id.', async () => {
    const fakeId = '05766d27-f634-45ea-ac82-eb53ae5d67fe'

    const res = await getAccountByIdForTests(
      request, appServer, fakeId, authToken
    )

    expect(res.statusCode).toEqual(404)
    expect(res.body.message).toEqual('No account found for given id.')
  })
})

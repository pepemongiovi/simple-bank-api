# Simple Bank API

A simple bank api made with NodeJS using Typescript, Docker, TypeORM, PostgreSQL and Redis for rate limiting.

## Prerequisites

- Install [Docker Engine](https://docs.docker.com/engine/install/)
- Install [Docker Compose](https://docs.docker.com/compose/install/)

## How to run API:

- Navigate to project's root directory in terminal
- Make sure Docker is running
- Run `docker-compose up -d`
- Access API through port 3333

## How to run tests

- If you have yarn installed, just run `yarn test`
- If you don't have yarn installed, run `docker exec -ti bank-api sh -c "yarn test"`

## Routes

- **Users**

  - **[POST] Create user:** `/users`
  - **[GET] Get user by id:** `/users/:id`
  - **[PUT] Update user:** `/users`
  - **[DELETE] Delete user:** `/users/:id`

- **Sessions**

  - **[POST] Authenticate:** /sessions

- **Banks**

  - **[POST] Create bank:** `/banks`
  - **[GET] Get bank by id:** `/banks/:id`
  - **[PUT] Update bank:** `/banks`
  - **[DELETE] Delete bank:** `/banks/:id`
  - **[POST] Bank account deposit:** `/banks/deposit`
  - **[POST] Bank account withdraw:** `/banks/withdraw`
  - **[POST] Bank account transfer:** `/banks/transfer`
  - **[POST] Gets account's transactions history from a period:** `/banks/transactions`

- **Accounts**

  - **[POST] Create account:** `/accounts`
  - **[GET] Get account by id:** `/accounts/:id`
  - **[PUT] Update account balance:** `/accounts/:id/balance`
  - **[DELETE] Delete account:** `/accounts/:id`

- **Transactions**

  - **[POST] Create transaction:** `/transaction`

# Simple Bank API
A simple bank api made with NodeJS using Typescript.

## Prerequisites
  - Install [Yarn](https://classic.yarnpkg.com/en/docs/install)
  - Install [Docker Engine](https://docs.docker.com/engine/install/)
  - Install [Docker Compose](https://docs.docker.com/compose/install/)

## Steps to run:
  ### Inicialize the container
  - Navigate to project root directory in terminal
  - Run "docker-compose up -d"

  ### [ONLY ON FIRST RUN] Create the datebases and run the migrations
  - Create the database "yarn create-db"
  - Run "yarn run-migrations"

  ### Access
  - Access api through port 3333

## Routes
  ### Users
    - [POST] Create user: /users
    - [GET] Get user by id: /users/:id
    - [PUT] Update user: [PUT] /users
    - [DELETE] Delete user: /users/:id
  ### Sessions
    - [POST] Authenticate: /sessions
  ### Banks
    - [POST] Create bank: /banks
    - [GET] Get bank by id: /banks/:id
    - [PUT] Update bank: /banks
    - [DELETE] Delete bank: /banks/:id
    - [POST] Bank account deposit: /banks/deposit
    - [POST] Bank account withdraw: /banks/withdraw
    - [POST] Bank account transfer: /banks/transfer
    - [POST] Gets account's transactions history from a period: /banks/transactions
  ### Accounts
    - [POST] Create account: /accounts
    - [GET] Get account by id: /accounts/:id
    - [PUT] Update account balance: /accounts/:id/balance
    - [DELETE] Delete account: /accounts/:id
  ### Transactions
    - [POST] Create transaction: /transaction





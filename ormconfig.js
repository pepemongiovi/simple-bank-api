module.exports = {
  "name": process.env.DEFAULT_CONNECTION,
  "type": "postgres",
	"host": process.env.POSTGRES_HOST,
  "port": process.env.POSTGRES_PORT,
  "username": process.env.POSTGRES_USER,
  "password": process.env.POSTGRES_PASS,
  "database": process.env.POSTGRES_DB,
  "migrations": [
    "./src/shared/infra/typeorm/migrations/*.ts"
  ],
  "cli": {
    "entitiesDir": "./src/modules/*/infra/typeorm/entities",
    "migrationsDir": "./src/shared/infra/typeorm/migrations",
    "subscribersDir": "./src/shared/infra/typeorm/subscribers",
  },
  "entities": [
    "./src/modules/*/infra/typeorm/entities/*.ts",
    "./dist/modules/*/infra/typeorm/entities/*.ts"
  ],
  "subscribers": [
    "./src/shared/infra/typeorm/subscribers/*.ts"
  ],
}

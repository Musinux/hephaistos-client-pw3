const { postgres } = require('../server.config.js')
const pgtools = require('pgtools')
const { Pool } = require('pg')

const p = {
  user: postgres.user,
  password: postgres.password,
  host: postgres.host
}

class PostgresStore {
  /** @type { import('pg').Pool } */
  connection
  static async init () {
    this.pool = new Pool(postgres)
  }

  static async close () {
    if (this.pool) this.pool.close()
    this.pool = null
  }

  static async reset () {
    await this.init()
    await pgtools.dropdb(p, postgres.database)
    await pgtools.createdb(p, postgres.database)
    await this.init()
    await this.buildTables()
    await this.runInitScripts()
    await this.createSessions()
  }

  static async buildTables () {
    const models = require('../models/model-by-name.js')
    for (const model of models) {
      await this.pool.query(model.toSqlTable())
    }
  }

  static async runInitScripts () {
    const models = require('../models/model-by-name.js')
    for (const model of models) {
      if (model.initScript) {
        await this.pool.query(await model.initScript())
      }
    }
  }

  static async createSessions () {
    const SQL = `
    CREATE TABLE "session" (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL
    )
    WITH (OIDS=FALSE);

    ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      NOT DEFERRABLE INITIALLY IMMEDIATE;

    CREATE INDEX "IDX_session_expire" ON "session" ("expire");`

    await this.pool.query(SQL)
  }
}

module.exports = PostgresStore

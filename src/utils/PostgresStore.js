const { postgres } = require('../server.config.js')
const pgtools = require('pgtools')
const { Pool } = require('pg')
const showdown = require('showdown')
const converter = new showdown.Converter()

const p = {
  user: postgres.user,
  password: postgres.password,
  host: postgres.host
}

class PostgresStore {
  /** @type { import('pg').Pool } */
  pool

  async init () {
    this.pool = new Pool(postgres)
  }

  async close () {
    if (this.pool) this.pool.close()
    this.pool = null
  }

  async reset () {
    await this.init()
    await pgtools.dropdb(p, postgres.database)
    await pgtools.createdb(p, postgres.database)
    await this.init()
    await this.buildTables()
    await PostgresStore.runInitScripts()
    await this.createSessions()
    await PostgresStore.generateSampleExercises()
  }

  static async generateSampleExercises () {
    const sessions = require('./sample_exercises.json')
    const Module = require('../models/module.model.js')
    const Session = require('../models/session.model.js')
    const Exercise = require('../models/exercise.model.js')
    const SessionExercise = require('../models/session-exercise.model.js')

    const module = await Module.create({
      name: '1A - S1 - Programmation Python',
      creation_date: new Date()
    })

    for (const s of sessions) {
      const session = await Session.create({
        module_id: module.id,
        name: s.name,
        exam_mode: false,
        random_order: false,
        start_date: null,
        end_date: null,
        real_end_date: null,
        creation_date: new Date()
      })
      for (const e of s.exercises) {
        const exercise = await Exercise.create({
          visible_to_participants: true,
          title: e.title,
          lang: e.lang,
          instructions: converter.makeHtml(e.instructions),
          tests: e.tests,
          solution: e.solution,
          template_regions: e.template_regions,
          template_regions_rw: e.template_regions_rw,
          difficulty: e.difficulty,
          score: e.score,
          creation_date: e.creation_date
        })
        await SessionExercise.add(session.id, exercise.id, e.sequence_id)
      }
    }
  }

  async buildTables () {
    const models = require('../models/model-by-name.js')
    for (const model of models) {
      const q = model.toSqlTable()
      if (Array.isArray(q)) {
        for (const query of q) {
          console.log(query)
          await this.pool.query(query)
        }
      } else {
        console.log(q)
        await this.pool.query(q)
      }
    }
  }

  static async runInitScripts () {
    const models = require('../models/model-by-name.js')
    for (const model of models) {
      if (model.initScript) {
        await model.initScript()
      }
    }
  }

  async createSessions () {
    const SQL = `
    CREATE TABLE "express_session" (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL
    )
    WITH (OIDS=FALSE);

    ALTER TABLE "express_session" ADD CONSTRAINT "express_session_pkey" PRIMARY KEY ("sid")
      NOT DEFERRABLE INITIALLY IMMEDIATE;

    CREATE INDEX "IDX_express_session_expire" ON "express_session" ("expire");`

    await this.pool.query(SQL)
  }
}

module.exports = new PostgresStore()

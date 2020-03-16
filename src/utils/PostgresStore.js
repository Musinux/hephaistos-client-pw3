const { postgres } = require('../server.config.js')
const pgtools = require('pgtools')
const { Pool } = require('pg')
const showdown = require('showdown')
const converter = new showdown.Converter()
const fs = require('fs')
const { promisify } = require('util')
const writeFile = promisify(fs.writeFile)
const path = require('path')

const p = {
  user: postgres.user,
  password: postgres.password,
  host: postgres.host
}

/** @param {Number} length */
function makeid (length) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
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
    await PostgresStore.generateSampleUsers()
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
    let sequenceId = 1
    for (const s of sessions) {
      const session = await Session.create({
        module_id: module.id,
        name: s.name,
        exam_mode: false,
        random_order: false,
        start_date: null,
        end_date: null,
        real_end_date: null,
        creation_date: new Date(),
        sequence_id: sequenceId++
      })
      for (const e of s.exercises) {
        const exercise = await Exercise.create({
          visible_to_participants: true,
          title: e.title,
          lang: e.lang,
          instructions: converter.makeHtml(e.instructions),
          tests: e.tests,
          template_regions: [e.solution],
          template_regions_rw: [0], // NO READ by default
          difficulty: e.difficulty,
          score: e.score,
          creation_date: e.creation_date
        })
        await SessionExercise.add(session.id, exercise.id, e.sequence_id)
      }
    }
  }

  static async generateSampleUsers () {
    const users = []
    const { names } = require('./sample_names.json')
    const ModuleUserRole = require('../models/module-user-role.model.js')
    const User = require('../models/user.model.js')
    const moduleId = 1
    const teacherRoleId = 2
    const studentRoleId = 3
    for (let i = 0; i < names.length; i++) {
      const n = names[i]
      const u = {
        firstname: n.firstname,
        lastname: n.lastname,
        email: `${n.firstname.toLowerCase()}.${n.lastname.toLowerCase()}@gmail.com`,
        password: makeid(10)
      }
      const user = await User.create(u)
      users.push(u)
      if (i < names.length / 2) {
        u.role = 'STUDENT'
        await ModuleUserRole.add(moduleId, user.id, studentRoleId)
      } else if ((i - 2) < names.length / 2) {
        u.role = 'TEACHER'
        await ModuleUserRole.add(moduleId, user.id, teacherRoleId)
      } else {
        u.role = 'NONE'
      }
    }
    await writeFile(path.join(__dirname, '../../saved_users.json'),
      JSON.stringify(users, null, 2))
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

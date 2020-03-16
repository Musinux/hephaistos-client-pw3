/* eslint camelcase: 0 */
const PostgresStore = require('../utils/PostgresStore.js')
const HephaistosService = require('../utils/HephaistosService.js')
// const debug = require('debug')('hephaistos:exercise-attempt.model.js')
const Exercise = require('./exercise.model.js')
const Session = require('./session.model.js')
const REGION_RW = 6
// const REGION_RO = 4
const REGION_NOREAD = 0

class ExerciseAttempt {
  /** @type {Number} */
  id
  /** @type {Boolean} */
  valid
  /** @type {Number} */
  valid_tests
  /** @type {Number} */
  invalid_tests
  /** @type {Number} */
  user_id
  /** @type {Number} */
  exercise_id
  /** @type {Number|null} */
  session_id
  /** @type {String[]} */
  regions
  /** @type {Boolean} */
  syntax_error
  /** @type {Date} */
  creation_date

  /**
   * @param {Number} exerciseId
   */
  static async deleteAllForExercise (exerciseId) {
    await PostgresStore.pool.query({
      text: `DELETE FROM ${ExerciseAttempt.tableName} WHERE exercise_id=$1`,
      values: [exerciseId]
    })
  }

  /**
   * @param {Number} userId
   */
  static async deleteAllForUser (userId) {
    await PostgresStore.pool.query({
      text: `DELETE FROM ${ExerciseAttempt.tableName} WHERE user_id=$1`,
      values: [userId]
    })
  }

  /**
   * @param { import('./user.model') } user
   * @param {Number} exerciseId
   * @returns {Promise<ExerciseAttempt>}
   */
  static async getMyLastAttempt (user, exerciseId) {
    const result = await PostgresStore.pool.query({
      text: `SELECT * FROM ${ExerciseAttempt.tableName}
      WHERE exercise_id = $1 AND user_id = $2
      ORDER BY id DESC
      LIMIT 1`,
      values: [exerciseId, user.id]
    })
    return result.rows.length ? result.rows[0] : null
  }

  /**
   * @param { import('./user.model') } user
   * @param {Number} sessionId
   * @param {Number} exerciseId
   * @param {String[]} regions
   * @returns { Promise<import('../utils/HephaistosService').APIResult> }
   */
  static async create (user, sessionId, exerciseId, regions) {
    const exercise = await Exercise.findById(exerciseId)
    const kept_regions = []
    const solution = exercise.template_regions
      .filter((r, i) => {
        const ok = exercise.template_regions_rw[i] !== REGION_NOREAD
        if (ok) kept_regions.push(exercise.template_regions_rw[i])
        return ok
      })
      .map((r, i) => kept_regions[i] === REGION_RW ? regions[i] : r)
      .join('\n')

    const exec = await HephaistosService.execute(solution, exercise.tests, exercise.lang)

    const valid = !exec.result.stats.errors && !exec.result.stats.failures
    const validTests = exec.result.tests.filter(t => !t.failure).length
    const invalidTests = exec.result.tests.length - validTests
    const syntaxError = !!exec.result.stats.errors

    await PostgresStore.pool.query({
      text: `INSERT INTO ${ExerciseAttempt.tableName} (
        user_id, exercise_id, session_id, regions, valid,
        valid_tests, invalid_tests, syntax_error,
        creation_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      values: [user.id, exerciseId, sessionId, regions, valid, validTests,
        invalidTests, syntaxError, new Date()]
    })
    return exec
  }

  static toSqlTable () {
    const User = require('./user.model.js')
    return `
    CREATE TABLE ${ExerciseAttempt.tableName} (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES ${User.tableName}(id),
      exercise_id INTEGER REFERENCES ${Exercise.tableName}(id),
      session_id INTEGER REFERENCES ${Session.tableName}(id),
      regions TEXT [],
      valid BOOLEAN,
      syntax_error BOOLEAN,
      valid_tests INTEGER,
      invalid_tests INTEGER,
      creation_date TIMESTAMP NOT NULL
    )
    `
  }
}

/** @type {String} */
ExerciseAttempt.tableName = 'exercise_attempt'

module.exports = ExerciseAttempt

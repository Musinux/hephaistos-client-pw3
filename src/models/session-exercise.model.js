/* eslint camelcase: 0 */
const PostgresStore = require('../utils/PostgresStore.js')
const debug = require('debug')('hephaistos:session-exercise.model.js')
const Exercise = require('./exercise.model.js')
const Session = require('./session.model.js')
const ExerciseAttempt = require('./exercise-attempt.model.js')

class SessionExercise {
  /** @type {Number} */
  session_id
  /** @type {Number} */
  exercise_id
  /** @type {Number} */
  sequence_id

  /**
   * @param {Number} id
   * @param {Number} sessionId
   * @returns {Promise<Boolean>}
   */
  static async isExerciseInSession (id, sessionId) {
    console.log('id, sessionId', id, sessionId)
    const result = await PostgresStore.pool.query({
      text: `SELECT 1 FROM ${Exercise.tableName} as exo
      LEFT JOIN ${SessionExercise.tableName} as se
      ON se.exercise_id = exo.id
      WHERE exo.id = $1
        AND se.session_id = $2`,
      values: [id, sessionId]
    })
    return !!result.rows.length
  }

  /**
   * @param { import('./user.model') } user
   * @param {Number} sessionId
   * @param {String[]} scope
   * @returns {Promise<Exercise[]>}
   */
  static async getBySessionId (user, sessionId, scope) {
    const fields = scope.map(_ => {
      if (_ === 'sequence_id') {
        return `se.${_} AS ${_}`
      }
      if (_ === 'valid') {
        return 'attempt.valid AS valid'
      }
      return `exo.${_} AS ${_}`
    }).join(',')

    const result = await PostgresStore.pool.query({
      text: `
      SELECT ${fields} FROM ${Exercise.tableName} AS exo
      LEFT JOIN ${SessionExercise.tableName} AS se
       ON se.exercise_id = exo.id
      LEFT JOIN ${ExerciseAttempt.tableName} AS attempt
       ON attempt.exercise_id = exo.id
        AND attempt.user_id = $2
        AND attempt.valid = TRUE
      WHERE se.session_id = $1
      ORDER BY se.sequence_id
      `,
      values: [sessionId, user.id]
    })
    return result.rows
  }

  /**
   * @param {Number} sessionId
   * @param {Number} exerciseId
   */
  static async remove (sessionId, exerciseId) {
    const result = await PostgresStore.pool.query({
      text: `DELETE FROM ${SessionExercise.tableName} 
        WHERE session_id=$1 AND exercise_id=$2`,
      values: [sessionId, exerciseId]
    })
    debug('result', result.rows[0])
    return result.rows[0]
  }

  /**
   * @param {Number} sessionId
   * @param {Number} exerciseId
   * @param {Number} sequenceId
   */
  static async add (sessionId, exerciseId, sequenceId = -1) {
    const result = await PostgresStore.pool.query({
      text: `INSERT INTO ${SessionExercise.tableName} 
        (session_id, exercise_id, sequence_id) VALUES ($1, $2, $3) RETURNING *`,
      values: [sessionId, exerciseId, sequenceId]
    })
    debug('result', result.rows[0])
    return result.rows[0]
  }

  static toSqlTable () {
    return [`
      CREATE TABLE ${SessionExercise.tableName} (
        session_id INTEGER REFERENCES ${Session.tableName}(id),
        exercise_id INTEGER REFERENCES ${Exercise.tableName}(id),
        sequence_id INTEGER
      )`,
      `ALTER TABLE ${SessionExercise.tableName} ADD UNIQUE(session_id, exercise_id)`
    ]
  }
}

/** @type {String} */
SessionExercise.tableName = 'session_exercise'

module.exports = SessionExercise

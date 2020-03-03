/* eslint camelcase: 0 */
const PostgresStore = require('../utils/PostgresStore.js')
const debug = require('debug')('hephaistos:module-exercise.model.js')
const Exercise = require('./exercise.model.js')
const Session = require('./session.model.js')
const Module = require('./module.model.js')
const ModuleUserRole = require('./module-user-role.model.js')
const RoleAccessRight = require('./role-access-right.model.js')

class ModuleExercise {
  /** @type {Number} */
  module_id
  /** @type {Number} */
  exercise_id
  /** @type {Number} */
  sequence_id

  /**
   * @param {import('./user.model')} user
   * @param {Number} moduleId
   * @param {String[]} scope
   * @returns {Promise<Exercise[]>}
   */
  static async getByModuleId (user, moduleId, scope) {
    const fields = scope.map(_ => `exo.${_} AS ${_}`).join(',')

    const result = await PostgresStore.pool.query({
      text: `SELECT ${fields} FROM ${Exercise.tableName} AS exo
      LEFT JOIN ${ModuleExercise.tableName} AS me
       ON me.exercise_id = exo.id
      LEFT JOIN ${Module.tableName} AS module
       ON module.id = me.module_id
      WHERE module.id = $1
        AND (exo.visible_to_participants=TRUE
          OR EXISTS (
              SELECT 1 FROM ${Module.tableName} AS m
                LEFT JOIN ${ModuleUserRole.tableName} AS r ON m.id=r.module_id
                LEFT JOIN ${RoleAccessRight.tableName} AS ar ON r.role_id=ar.role_id
              WHERE m.id = $1
                AND r.user_id = $2
                AND ar.access_right = 'module.edit' -- only editors can see invisible_exos
              LIMIT 1
            ))
      ORDER BY me.sequence_id
      `,
      values: [moduleId, user.id]
    })
    return result.rows
  }

  /**
   * @param {Number} moduleId
   * @param {Number} exerciseId
   */
  static async remove (moduleId, exerciseId) {
    const result = await PostgresStore.pool.query({
      text: `DELETE FROM ${ModuleExercise.tableName} 
        WHERE module_id=$1 AND exercise_id=$2`,
      values: [moduleId, exerciseId]
    })
    debug('result', result.rows[0])
    return result.rows[0]
  }

  /**
   * @param {Number} moduleId
   * @param {Number} exerciseId
   * @param {Number} sequenceId
   */
  static async add (moduleId, exerciseId, sequenceId = -1) {
    const result = await PostgresStore.pool.query({
      text: `INSERT INTO ${ModuleExercise.tableName} 
        (module_id, exercise_id, sequence_id) VALUES ($1, $2, $3) RETURNING *`,
      values: [moduleId, exerciseId, sequenceId]
    })
    debug('result', result.rows[0])
    return result.rows[0]
  }

  static toSqlTable () {
    return [`
      CREATE TABLE ${ModuleExercise.tableName} (
        module_id INTEGER REFERENCES ${Session.tableName}(id),
        exercise_id INTEGER REFERENCES ${Exercise.tableName}(id),
        sequence_id INTEGER
      )`,
      `ALTER TABLE ${ModuleExercise.tableName} ADD UNIQUE(module_id, exercise_id)`
    ]
  }
}

/** @type {String} */
ModuleExercise.tableName = 'module_exercise'

module.exports = ModuleExercise

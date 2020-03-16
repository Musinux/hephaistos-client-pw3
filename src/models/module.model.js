/* eslint camelcase: 0 */
const PostgresStore = require('../utils/PostgresStore.js')
const debug = require('debug')('hephaistos:module.model.js')
const ModuleUserRole = require('./module-user-role.model.js')
const RoleAccessRight = require('./role-access-right.model.js')
const accessRights = require('./access-rights.definition.js')

class Module {
  /** @type {Number} */
  id
  /** @type {String} */
  name
  /** @type {Date} */
  creation_date

  /**
   * @param {Number} id
   * @returns {Promise<Module>}
   */
  static async getById (id) {
    const result = await PostgresStore.pool.query({
      text: `SELECT * FROM ${Module.tableName} WHERE id=$1`,
      values: [id]
    })
    return result.rows[0]
  }

  /**
   * @param {import('./user.model')} user
   * @param {Number} moduleId
   * @param {String} right
   * @returns {Promise<Boolean>}
   */
  static async hasAccessRight (user, moduleId, right) {
    if (user.hasGlobalAccessRight(right)) return true
    const result = await PostgresStore.pool.query({
      text: `
      SELECT 1 FROM ${Module.tableName} AS m
        LEFT JOIN ${ModuleUserRole.tableName} AS r ON m.id = r.module_id
        LEFT JOIN ${RoleAccessRight.tableName} AS ar ON r.role_id = ar.role_id
      WHERE m.id = $1
        AND r.user_id = $2
        AND ar.access_right = $3
      LIMIT 1`,
      values: [moduleId, user.id, right]
    })
    return !!result.rows.length
  }

  /**
   * @param {import('./user.model')} user
   * @returns {Promise<Module[]>}
   */
  static async getMyModules (user) {
    if (user.hasGlobalAccessRight(accessRights.module.view)) {
      const result = await PostgresStore.pool.query(
        `SELECT id, name FROM ${Module.tableName}`
      )
      return result.rows
    }
    const result = await PostgresStore.pool.query({
      text: `
      SELECT * FROM ${Module.tableName} AS m
        LEFT JOIN ${ModuleUserRole.tableName} AS r ON m.id=r.module_id
      WHERE r.user_id=$1`,
      values: [user.id]
    })
    return result.rows
  }

  /**
    * @param {Number} id
    * @param {String} name
    * @returns {Promise<Module>}
    */
  static async update (id, name) {
    const result = await PostgresStore.pool.query({
      text: `UPDATE ${Module.tableName} SET name = $1
        WHERE id=$2 RETURNING *`,
      values: [name, id]
    })
    debug('result', result.rows[0])
    return result.rows[0]
  }

  /**
   * @param {Object.<('name'|'creation_date'), any>} params
   * @returns {Promise<Module>}
   */
  static async create (params) {
    if (Object.keys(params).length === 0) return null

    // filter out any non-alphanumeric parameter
    const fields = Object.keys(params)
      .filter(_ => _ !== 'id' && !_.match(/[^a-z_]/))

    const variables = fields.map((_, i) => `$${i + 1}`).join(', ')
    const values = fields.map(_ => params[_])
    const fieldNames = fields.join(',')

    const q = {
      text: `INSERT INTO ${Module.tableName} (${fieldNames}) VALUES (${variables})
        RETURNING *`,
      values
    }

    debug('q', q)

    const result = await PostgresStore.pool.query(q)
    debug('result', result.rows[0])
    return result.rows[0]
  }

  /**
   * @param {Number} id
   */
  static async delete (id) {
    const Exercise = require('./exercise.model.js')
    const ModuleExercise = require('./module-exercise.model.js')
    const Session = require('./session.model.js')
    const ModuleUserRole = require('./module-user-role.model.js')

    const sessions = await Session.getByModuleId(id)

    for (const session of sessions) {
      await Session.delete(session.id)
    }
    const { rows: exercises } = await PostgresStore.pool.query({
      text: `SELECT exercise_id as id FROM ${ModuleExercise.tableName}
        WHERE module_id = $1`,
      values: [id]
    })
    for (const exercise of exercises) {
      await Exercise.delete(exercise.id)
    }

    try {
      await PostgresStore.pool.query('BEGIN')
      await PostgresStore.pool.query({
        text: `DELETE FROM ${ModuleUserRole.tableName} WHERE module_id=$1`,
        values: [id]
      })
      await PostgresStore.pool.query({
        text: `DELETE FROM ${Module.tableName} WHERE id=$1`,
        values: [id]
      })
      await PostgresStore.pool.query('COMMIT')
    } catch (err) {
      await PostgresStore.pool.query('ROLLBACK')
      throw err
    }
  }

  static toSqlTable () {
    return `
    CREATE TABLE ${Module.tableName} (
      id SERIAL PRIMARY KEY,
      name TEXT,
      creation_date TIMESTAMP NOT NULL
    )
    `
  }
}

/** @type {String} */
Module.tableName = 'module'

module.exports = Module

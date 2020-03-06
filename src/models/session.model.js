/* eslint camelcase: 0 */
const PostgresStore = require('../utils/PostgresStore.js')
const debug = require('debug')('hephaistos:session.model.js')
const Module = require('./module.model.js')
const ModuleUserRole = require('./module-user-role.model.js')
const RoleAccessRight = require('./role-access-right.model.js')

class Session {
  /** @type {Number} */
  id
  /** @type {String} */
  name
  /** @type {Boolean} */
  exam_mode
  /** @type {Boolean} */
  random_order
  /** @type {Date|null} */
  start_date
  /** @type {Date|null} */
  end_date
  /** @type {Date|null} */
  real_end_date
  /** @type {Date} */
  creation_date

  /**
   * @param {Number} sessionId
   * @returns {Promise<Session>}
   */
  static async getById (sessionId) {
    const result = await PostgresStore.pool.query({
      text: `
        SELECT id, name, creation_date FROM ${Session.tableName}
        WHERE id=$1
      `,
      values: [sessionId]
    })
    return result.rows[0]
  }

  /**
   * @param {import('./user.model')} user
   * @param {Number} sessionId
   * @param {String} right
   * @returns {Promise<Boolean>}
   */
  static async hasAccessRight (user, sessionId, right) {
    if (user.hasGlobalAccessRight(right)) return true
    const result = await PostgresStore.pool.query({
      text: `
      SELECT 1 FROM ${Session.tableName} AS s
        LEFT JOIN ${ModuleUserRole.tableName} AS r ON s.module_id = r.module_id
        LEFT JOIN ${RoleAccessRight.tableName} AS ar ON r.role_id = ar.role_id
      WHERE s.id = $1
        AND r.user_id = $2
        AND ar.access_right = $3
      LIMIT 1`,
      values: [sessionId, user.id, right]
    })
    return !!result.rows.length
  }

  /**
   * @param {Number} moduleId
   * @returns {Promise<Session[]>}
   */
  static async getByModuleId (moduleId) {
    const result = await PostgresStore.pool.query({
      text: `SELECT * FROM ${Session.tableName} WHERE module_id = $1`,
      values: [moduleId]
    })
    return result.rows
  }

  /**
    * @param {Number} id
    * @param {Object.<('name'), any>} params */
  static async update (id, params) {
    if (Object.keys(params).length === 0) return null

    // filter out any non-alphanumeric parameter
    const fields = Object.keys(params)
      .filter(_ => _ !== 'id' && _ !== 'creation_date' && !_.match(/[^a-z_]/))

    const variables = fields.map((_, i) => `$${i + 1}`).join(', ')
    const values = fields.map(_ => params[_])
    const fieldNames = fields.join(',')

    values.push(id)

    // TODO: move the current entry in a _revisions table, and update the
    // current one
    const q = {
      text: `UPDATE ${Exercise.tableName} SET (${fieldNames}) = (${variables})
        WHERE id=$${values.length} RETURNING *`,
      values
    }

    debug('q', q)

    const result = await PostgresStore.pool.query(q)
    debug('result', result.rows[0])
    return result.rows[0]
  }

  /** @param {Object.<('name'|'creation_date'), any>} params */
  static async create (params) {
    if (Object.keys(params).length === 0) return null

    // filter out any non-alphanumeric parameter
    const fields = Object.keys(params)
      .filter(_ => _ !== 'id' && !_.match(/[^a-z_]/))

    const variables = fields.map((_, i) => `$${i + 1}`).join(', ')
    const values = fields.map(_ => params[_])
    const fieldNames = fields.join(',')

    const result = await PostgresStore.pool.query({
      text: `INSERT INTO ${Session.tableName} (${fieldNames}) VALUES (${variables})
        RETURNING *`,
      values
    })
    debug('result', result.rows[0])
    return result.rows[0]
  }

  static toSqlTable () {
    return `
    CREATE TABLE ${Session.tableName} (
      id SERIAL PRIMARY KEY,
      module_id INTEGER REFERENCES ${Module.tableName}(id),
      name TEXT,
      exam_mode BOOLEAN,
      random_order BOOLEAN,
      start_date TIMESTAMP,
      end_date TIMESTAMP,
      real_end_date TIMESTAMP,
      creation_date TIMESTAMP NOT NULL
    )
    `
  }
}

/** @type {String} */
Session.tableName = 'session'

module.exports = Session

/* eslint camelcase: 0 */
const PostgresStore = require('../utils/PostgresStore.js')
const debug = require('debug')('hephaistos:module-user-role.model.js')
const User = require('./user.model.js')
const Module = require('./module.model.js')
const Role = require('./role.model.js')

class ModuleUserRole {
  /** @type {Number} */
  module_id
  /** @type {Number} */
  user_id
  /** @type {Number} */
  role_id

  /**
   * @param {Number} moduleId
   * @param {String[]} scope
   * @returns {Promise<User[]>}
   */
  static async getByModuleId (moduleId, scope) {
    const fields = scope.map(_ => _ === 'role'
      ? 'r.name AS role'
      : `user.${_} AS ${_}`
    ).join(',')

    const result = await PostgresStore.pool.query({
      text: `SELECT ${fields} FROM${User.tableName} AS user
      LEFT JOIN ${ModuleUserRole.tableName} AS me
       ON me.user_id = user.id
      LEFT JOIN ${Role.tableName} AS r
       ON r.id = me.role_id
      LEFT JOIN  ${Module.tableName} AS module
       ON module.id = me.module_id
      WHERE module.id = $1
      ORDER BY r.name, user.lastname, user.firstname
      `,
      values: [moduleId]
    })
    return result.rows
  }

  /**
   * @param {Number} moduleId
   * @param {Number} userId
   */
  static async remove (moduleId, userId) {
    const result = await PostgresStore.pool.query({
      text: `DELETE FROM ${ModuleUserRole.tableName} 
        WHERE module_id=$1 AND user_id=$2`,
      values: [moduleId, userId]
    })
    debug('result', result.rows[0])
    return result.rows[0]
  }

  /**
   * @param {Number} moduleId
   * @param {Number} userId
   * @param {Number} roleId
   */
  static async add (moduleId, userId, roleId) {
    const result = await PostgresStore.pool.query({
      text: `INSERT INTO ${ModuleUserRole.tableName} 
        (module_id, user_id, role_id) VALUES ($1, $2, $3) RETURNING *`,
      values: [moduleId, userId, roleId]
    })
    debug('result', result.rows[0])
    return result.rows[0]
  }

  static toSqlTable () {
    const Module = require('./module.model.js')
    return [`
      CREATE TABLE ${ModuleUserRole.tableName} (
        module_id INTEGER REFERENCES ${Module.tableName}(id),
        user_id INTEGER REFERENCES ${User.tableName}(id),
        role_id INTEGER REFERENCES ${Role.tableName}(id)
      )`,
      `ALTER TABLE ${ModuleUserRole.tableName} ADD UNIQUE(module_id, user_id)`
    ]
  }
}

/** @type {String} */
ModuleUserRole.tableName = 'module_user_role'

module.exports = ModuleUserRole

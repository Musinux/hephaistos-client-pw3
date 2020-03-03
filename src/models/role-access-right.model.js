/* eslint camelcase: 0 */
const PostgresStore = require('../utils/PostgresStore.js')
// const debug = require('debug')('hephaistos:role-access-right.model.js')
const Role = require('./role.model.js')

class RoleAccessRight {
  /** @type {Number} */
  role_id
  /** @type {String} */
  access_right

  /**
   * @param {Number} roleId
   * @returns {Promise<RoleAccessRight[]>}
   */
  static async getByRoleId (roleId) {
    const result = await PostgresStore.pool.query({
      text: `SELECT access_right FROM ${RoleAccessRight.tableName}
      WHERE role_id = $1`,
      values: [roleId]
    })
    return result.rows
  }

  /**
   * @param {Number} moduleId
   * @param {String} accessRight
   */
  static async remove (moduleId, accessRight) {
    return PostgresStore.pool.query({
      text: `DELETE FROM ${RoleAccessRight.tableName} 
        WHERE role_id=$1 AND access_right=$2`,
      values: [moduleId, accessRight]
    })
  }

  /**
   * @param {Number} moduleId
   * @param {String} accessRight
   */
  static async add (moduleId, accessRight) {
    return PostgresStore.pool.query({
      text: `INSERT INTO ${RoleAccessRight.tableName} 
        (role_id, access_right) VALUES ($1, $2)`,
      values: [moduleId, accessRight]
    })
  }

  static toSqlTable () {
    return [`
      CREATE TABLE ${RoleAccessRight.tableName} (
        role_id INTEGER REFERENCES ${Role.tableName}(id),
        access_right VARCHAR(50)
      )`,
      `ALTER TABLE ${RoleAccessRight.tableName} ADD UNIQUE(role_id, access_right)`
    ]
  }
}

/** @type {String} */
RoleAccessRight.tableName = 'role_access_right'

module.exports = RoleAccessRight

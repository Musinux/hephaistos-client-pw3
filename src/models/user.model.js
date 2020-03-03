const config = require('../server.config.js')
const PostgresStore = require('../utils/PostgresStore.js')
const LocalStrategy = require('passport-local').Strategy
const PlatformRole = require('./platform-role.model.js')
const RoleAccessRight = require('./role-access-right.model.js')
// const debug = require('debug')('hephaistos:exercise.model.js')
const bcrypt = require('bcrypt')

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

class User {
  /** @type {Number} */
  id
  /** @type {String} */
  firstname
  /** @type {String} */
  lastname
  /** @type {String} */
  email
  /** @type {String} */
  password
  /** @type {{id: Number, name: String, rights: String[]}} */
  role // only on current user for session

  /**
   * @param {Object.<('id'|'firstname'|'lastname'|'email'|'password'), any>} obj
   */
  constructor (obj) {
    this.id = obj.id
    this.firstname = obj.firstname
    this.lastname = obj.lastname
    this.email = obj.email
    this.password = obj.password
  }

  /**
   * @param {String} right
   */
  async hasGlobalAccessRight (right) {
    if (!this.role || !this.role.rights) return false
    return !!this.role.rights.find(r => r === right)
  }

  /**
   * @param {String} email
   * @param {Array<('id'|'firstname'|'lastname'|'email'|'password')>} scope
   * @returns {Promise<User|null>}
   */
  static async getByEmail (email, scope) {
    const result = await PostgresStore.pool.query({
      text: `SELECT ${scope.join(', ')} FROM ${User.tableName} WHERE email=$1`,
      values: [email]
    })
    return result.rows[0] || null
  }

  /**
   * @param {import('passport')} passport
   */
  static preparePassport (passport) {
    passport.use(new LocalStrategy(async (email, password, cb) => {
      try {
        const user = await User.isUserValid(email, password)
        if (user) {
          user.role = await User.getRoles(user)
          cb(null, user)
        } else {
          cb(null, false)
        }
      } catch (err) {
        cb(err)
      }
    }))

    passport.serializeUser((user, cb) => cb(null, user.id))
    passport.deserializeUser(async (id, cb) => {
      try {
        const user = await User.findById(id)
        if (user) {
          user.role = await User.getRoles(user)
          cb(null, user)
        } else {
          cb(null, false)
        }
      } catch (err) {
        cb(err)
      }
    })
  }

  /**
   * @param {User} user
   * @returns {Promise<{id: Number, name: String, rights: String[]}>}
   */
  static async getRoles (user) {
    const role = await PlatformRole.getUserRole(user)
    if (role) {
      const rights = await RoleAccessRight.getByRoleId(role.id)
      return {
        id: role.id,
        name: role.name,
        rights: rights.map(r => r.access_right)
      }
    }
    return { id: -1, name: 'NONE', rights: [] }
  }

  /**
   * @param {Number} id
   * @returns {Promise<User>}
   */
  static async findById (id) {
    if (typeof id !== 'number') throw new Error('TypeError: id is not a number')

    const result = await PostgresStore.pool.query({
      text: `SELECT id, firstname, lastname, email FROM ${User.tableName} WHERE id=$1`,
      values: [id]
    })
    return new User(result.rows[0])
  }

  /**
   * @param {String} email
   * @param {String} password
   * @returns {Promise<import('./user.model.js')|null>}
   */
  static async isUserValid (email, password) {
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new Error('TypeError: email or password are undefined')
    }

    const result = await PostgresStore.pool.query({
      text: 'SELECT * FROM users WHERE email=$1 LIMIT 1',
      values: [email]
    })

    if (result.rows.length === 0) {
      return null
    }

    const userRow = result.rows[0]
    const givenPassword = userRow.password
    delete userRow.password
    return await bcrypt.compare(password, givenPassword)
      ? userRow
      : null
  }

  static toSqlTable () {
    return `
    CREATE TABLE ${User.tableName} (
      id SERIAL PRIMARY KEY,
      firstname TEXT,
      lastname TEXT,
      password VARCHAR(60),
      email TEXT UNIQUE
    )
    `
  }

  static async initScript () {
    const password = makeid(10)
    const email = config.ADMIN_EMAIL || 'root@localhost'
    const firstname = config.ADMIN_FIRSTNAME || 'admin'
    const lastname = config.ADMIN_LASTNAME || 'admin'
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log(`admin user informations:
    email: ${email}
    password: ${password} (can't be recovered, please save this)`)
    return PostgresStore.pool.query({
      text: `
      INSERT INTO ${User.tableName} (email, firstname, lastname, password)
      VALUES ($1, $2, $3, $4)
    `,
      values: [email, firstname, lastname, hashedPassword]
    })
  }
}

/** @type {String} */
User.tableName = 'users'

module.exports = User

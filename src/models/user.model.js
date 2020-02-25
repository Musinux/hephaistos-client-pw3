const config = require('../server.config.js')
const PostgresStore = require('../utils/PostgresStore.js')
const LocalStrategy = require('passport-local').Strategy
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

  /**
   * @param {import('passport')} passport
   */
  static preparePassport (passport) {
    passport.use(new LocalStrategy(async (email, password, cb) => {
      try {
        const user = await User.isUserValid(email, password)
        if (user) {
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
        cb(null, user)
      } catch (err) {
        cb(err)
      }
    })
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
    return result.rows[0]
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
    return {
      text: `
      INSERT INTO ${User.tableName} (email, firstname, lastname, password)
      VALUES ($1, $2, $3, $4)
    `,
      values: [email, firstname, lastname, hashedPassword]
    }
  }
}

/** @type {String} */
User.tableName = 'users'

module.exports = User

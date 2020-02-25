/* eslint camelcase: 0 */
const PostgresStore = require('../utils/PostgresStore.js')
const debug = require('debug')('hephaistos:exercise.model.js')

class Exercise {
  /** @type {Number} */
  id
  /** @type {String} */
  lang
  /** @type {String} */
  instructions
  /** @type {String} */
  tests
  /** @type {String} */
  solution
  /** @type {String[]} */
  template_regions
  /** @type {Number[]} */
  template_regions_rw
  /** @type {Number} */
  difficulty
  /** @type {Number} */
  score
  /** @type {Date} */
  creation_date

  /**
   * TODO: pagination, reduction by category, visible/invisible...
   */
  static async getMultiple () {
    const q = {
      text: `SELECT * FROM ${Exercise.tableName}`/* ,
      values */
    }

    debug('q', q)

    const result = await PostgresStore.pool.query(q)

    return result.rows
  }

  /**
   * @param {Number} id
   */
  static async findById (id) {
    if (typeof id !== 'number') throw new Error('TypeError: id is not a number')

    const result = await PostgresStore.pool.query({
      text: `SELECT * FROM ${Exercise.tableName} WHERE id=$1`,
      values: [id]
    })

    debug('result', result.rows[0])
    return result.rows[0]
  }

  /**
    * @param {Number} id
    * @param {Object.<('instructions'|'tests'|'solution'|'template_regions'|'template_regions_rw'|'difficulty'|'score'|'creation_date'), any>} params */
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

  /** @param {Object.<('instructions'|'tests'|'solution'|'template_regions'|'template_regions_rw'|'difficulty'|'score'|'creation_date'), any>} params */
  static async create (params) {
    if (Object.keys(params).length === 0) return null

    // filter out any non-alphanumeric parameter
    const fields = Object.keys(params)
      .filter(_ => _ !== 'id' && !_.match(/[^a-z_]/))

    const variables = fields.map((_, i) => `$${i + 1}`).join(', ')
    const values = fields.map(_ => params[_])
    const fieldNames = fields.join(',')

    const q = {
      text: `INSERT INTO ${Exercise.tableName} (${fieldNames}) VALUES (${variables})
        RETURNING *`,
      values
    }

    debug('q', q)

    const result = await PostgresStore.pool.query(q)
    debug('result', result.rows[0])
    return result.rows[0]
  }

  static toSqlTable () {
    return `
    CREATE TABLE ${Exercise.tableName} (
      id SERIAL PRIMARY KEY,
      title TEXT,
      lang TEXT,
      instructions TEXT,
      tests TEXT,
      solution TEXT,
      template_regions TEXT [],
      template_regions_rw SMALLINT [], -- READ/WRITE access to students for specific
                                       -- regions, it has to be seemless
                                       -- for the exercise creator
      difficulty SMALLINT,
      score SMALLINT,
      creation_date TIMESTAMP NOT NULL
      -- creator,
      -- owner,
      -- editors
    )
    `
  }
}

/** @type {String} */
Exercise.tableName = 'exercise'

module.exports = Exercise

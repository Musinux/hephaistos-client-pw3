const config = require('../server.config.js')
const axios = require('axios')
/**
 * @typedef {Object} TestResult
 * @prop {String} file
 * @prop {Number} line
 * @prop {String} name
 * @prop {Number} time
 * @prop {Object} failure
 * @prop {String} failure.stacktrace
 * @prop {String} failure.message
 */

/**
 * @typedef {Object} TestSuite
 * @prop {Object} stats
 * @prop {Number} stats.errors
 * @prop {Number} stats.failures
 * @prop {Number} stats.skipped
 * @prop {Number} stats.tests
 * @prop {Number} stats.time
 * @prop {String} stats.timestamp
 * @prop {TestResult[]} tests
 */

/**
 * @typedef {Object} APIResult
 * @prop {String} stdout
 * @prop {String} stderr
 * @prop {TestSuite} result
 */

class HephaistosService {
  /**
   * @param {String} solution
   * @param {String} tests
   * @param {String} lang
   * @returns {Promise<APIResult>}
   */
  static async execute (solution, tests, lang) {
    if (!['python', 'c', 'javascript'].includes(lang)) {
      throw new Error("Can't execute code for language " + lang)
    }

    const result = await axios.post(`${config.HEPHAISTOS_URL}/${lang}/test`, {
      content: Buffer.from(solution).toString('base64'),
      test: Buffer.from(tests).toString('base64')
    })

    return result.data
  }
}

module.exports = HephaistosService

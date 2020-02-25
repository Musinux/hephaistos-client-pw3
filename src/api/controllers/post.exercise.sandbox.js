const config = require('../../server.config.js')
const axios = require('axios')

/**
 * Création d'un exercice
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function postTryExerciseExecute (req, res) {
  const { lang, tests, solution } = req.body

  if (!['python'].includes(lang)) {
    throw new Error("Can't execute code for language " + lang)
  }

  const result = await axios.post(`${config.HEPHAISTOS_URL}/${lang}/test`, {
    content: Buffer.from(solution).toString('base64'),
    test: Buffer.from(tests).toString('base64')
  })

  res.json(result.data)
}

module.exports = postTryExerciseExecute

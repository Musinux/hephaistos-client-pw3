const HephaistosService = require('../../utils/HephaistosService.js')
// const config = require('../../server.config.js')

/**
 * Création d'un exercice
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function postTryExerciseExecute (req, res) {
  const { lang, tests, solution } = req.body
  if (!['python', 'c', 'javascript'].includes(lang)) {
    throw new Error("Can't execute code for language " + lang)
  }

  const result = await HephaistosService.execute(solution, tests, lang)

  res.json(result)
}

module.exports = postTryExerciseExecute

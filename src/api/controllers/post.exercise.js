const Exercise = require('../../models/exercise.model.js')
// const debug = require('debug')('hephaistos:post.exercise.js')

/**
 * Création d'un exercice
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function postExercise (req, res) {
  if (!isNaN(parseInt(req.params.id))) {
    res.json(await Exercise.update(parseInt(req.params.id), req.body))
  } else {
    res.json(await Exercise.create(req.body))
  }
}

module.exports = postExercise

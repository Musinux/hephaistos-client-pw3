const Exercise = require('../../models/exercise.model.js')
// const debug = require('debug')('hephaistos:post.exercise.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function getExercises (req, res) {
  res.json(await Exercise.getMultiple())
}

module.exports = getExercises

const accessRights = require('../../models/access-rights.definition.js')
const Exercise = require('../../models/exercise.model.js')
const Session = require('../../models/session.model.js')
const SessionExercise = require('../../models/session-exercise.model')

/**
 * Création d'un exercice
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function postSessionExercise (req, res) {
  const sessId = parseInt(req.params.sessionId)
  if (!await Session.hasAccessRight(req.user, sessId, accessRights.module.edit)) {
    res.sendStatus(401)
    return
  }
  const {
    visible_to_participants, title, lang, instructions, tests, solution,
    template_regions, template_regions_rw, difficulty, score, creation_date
  } = req.body
  const exercise = await Exercise.create({
    visible_to_participants,
    title,
    lang,
    instructions,
    tests,
    solution,
    template_regions,
    template_regions_rw,
    difficulty,
    score,
    creation_date
  })
  const sequenceId = parseInt(req.body.sequence_id)
  await SessionExercise.add(sessId, exercise.id, !isNaN(sequenceId) ? sequenceId : -1)
  res.json(exercise)
}

module.exports = postSessionExercise

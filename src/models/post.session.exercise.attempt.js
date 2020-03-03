const accessRights = require('../../models/access-rights.definition.js')
const SessionExercise = require('../../models/session-exercise.model.js')
const Exercise = require('../../models/exercise.model.js')
const ExerciseAttempt = require('../../models/exercise-attempt.model.js')
const Session = require('../../models/session.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function postSessionExerciseAttempt (req, res) {
  const sessId = parseInt(req.params.sessionId)
  const id = parseInt(req.params.id)
  if (!await Session.hasAccessRight(req.user, sessId, accessRights.module.participate)) {
    res.sendStatus(401)
    return
  }

  if (typeof req.body.solution !== 'string') {
    res.sendStatus(400)
    return
  }

  res.json(await ExerciseAttempt.create(sessId, id, req.body.solution))
}

module.exports = postSessionExerciseAttempt

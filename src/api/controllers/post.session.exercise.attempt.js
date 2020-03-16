const accessRights = require('../../models/access-rights.definition.js')
const ExerciseAttempt = require('../../models/exercise-attempt.model.js')
const Session = require('../../models/session.model.js')

/**
 * Création d'un exercice
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

  if (!Array.isArray(req.body.regions)) {
    res.sendStatus(400)
    return
  }

  const result = await ExerciseAttempt.create(req.user, sessId, id, req.body.regions)

  res.json(result)
}

module.exports = postSessionExerciseAttempt

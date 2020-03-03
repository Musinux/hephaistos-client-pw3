const accessRights = require('../../models/access-rights.definition.js')
const ExerciseAttempt = require('../../models/exercise-attempt.model.js')
const Session = require('../../models/session.model.js')

/**
 * Création d'un exercice
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function getSessionExerciseLastAttempt (req, res) {
  const sessId = parseInt(req.params.sessionId)
  const id = parseInt(req.params.id)
  if (!await Session.hasAccessRight(req.user, sessId, accessRights.module.participate)) {
    res.sendStatus(401)
    return
  }

  const result = await ExerciseAttempt.getMyLastAttempt(req.user, id)
  if (result === null) {
    res.sendStatus(404)
    return
  }

  res.json(result)
}

module.exports = getSessionExerciseLastAttempt

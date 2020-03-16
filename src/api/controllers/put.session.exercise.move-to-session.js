const accessRights = require('../../models/access-rights.definition.js')
const Session = require('../../models/session.model.js')
const SessionExercise = require('../../models/session-exercise.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function putSessionMoveExerciseToSession (req, res) {
  const id = parseInt(req.params.id)
  const sessId = parseInt(req.params.sessionId)
  const newSessId = parseInt(req.body.newSessionId)
  const sequenceId = parseInt(req.body.sequenceId)
  if (!await Session.hasAccessRight(req.user, sessId, accessRights.module.edit)) {
    res.sendStatus(401)
    return
  }
  if (!await Session.hasAccessRight(req.user, newSessId, accessRights.module.edit)) {
    res.sendStatus(401)
    return
  }
  await SessionExercise.moveExerciseToSession(id, sessId, newSessId, sequenceId)
  res.json({ success: true })
}

module.exports = putSessionMoveExerciseToSession

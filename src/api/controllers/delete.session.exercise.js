const accessRights = require('../../models/access-rights.definition.js')
const Session = require('../../models/session.model.js')
const Exercise = require('../../models/exercise.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function deleteSessionExercise (req, res) {
  const sessId = parseInt(req.params.sessionId)
  const id = parseInt(req.params.id)
  if (!await Session.hasAccessRight(req.user, sessId, accessRights.module.edit)) {
    res.sendStatus(401)
    return
  }
  await Exercise.delete(id)
  res.json({ success: true })
}

module.exports = deleteSessionExercise

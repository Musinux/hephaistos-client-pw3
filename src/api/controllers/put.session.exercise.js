const accessRights = require('../../models/access-rights.definition.js')
const Exercise = require('../../models/exercise.model.js')
const Session = require('../../models/session.model.js')

/**
 * Modification d'un exercice
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function putSessionExercise (req, res) {
  const sessId = parseInt(req.params.sessionId)
  const id = parseInt(req.params.id)
  if (!await Session.hasAccessRight(req.user, sessId, accessRights.module.edit)) {
    res.sendStatus(401)
    return
  }
  res.json(await Exercise.update(id, sessId, req.body))
}

module.exports = putSessionExercise

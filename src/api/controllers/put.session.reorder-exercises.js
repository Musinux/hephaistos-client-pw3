const accessRights = require('../../models/access-rights.definition.js')
const Session = require('../../models/session.model.js')
const SessionExercise = require('../../models/session-exercise.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function putSessionReorderExercises (req, res) {
  const id = parseInt(req.params.id)
  if (!await Session.hasAccessRight(req.user, id, accessRights.module.edit)) {
    res.sendStatus(401)
    return
  }
  if (!Array.isArray(req.body.exercises)) {
    res.status(400)
      .send('exercises is not an array')
    return
  }
  await SessionExercise.updateSequenceIds(id, req.body.exercises)
  res.json({ success: true })
}

module.exports = putSessionReorderExercises

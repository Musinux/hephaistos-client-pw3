const accessRights = require('../../models/access-rights.definition.js')
const SessionExercise = require('../../models/session-exercise.model.js')
const Session = require('../../models/session.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function getSessionExercises (req, res) {
  const id = parseInt(req.params.id)
  if (!await Session.hasAccessRight(req.user, id, accessRights.module.participate)) {
    res.sendStatus(401)
    return
  }
  const scope = ['id', 'visible_to_participants', 'lang', 'title', 'difficulty', 'score', 'test_names', 'sequence_id', 'valid']
  res.json(await SessionExercise.getBySessionId(req.user, id, scope))
}

module.exports = getSessionExercises

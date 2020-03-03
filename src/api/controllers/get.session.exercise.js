const accessRights = require('../../models/access-rights.definition.js')
const Exercise = require('../../models/exercise.model.js')
const Session = require('../../models/session.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function getSessionExercise (req, res) {
  const sessId = parseInt(req.params.sessionId)
  const id = parseInt(req.params.id)
  if (!await Session.hasAccessRight(req.user, sessId, accessRights.module.participate)) {
    res.sendStatus(401)
    return
  }
  const scope = ['id', 'visible_to_participants',
    'lang', 'title', 'difficulty', 'score', 'test_names',
    'instructions', 'tests', 'template_regions', 'template_regions_rw']

  if (await Session.hasAccessRight(req.user, sessId, accessRights.module.edit)) {
    scope.push('solution')
  }
  res.json(await Exercise.findById(id, scope))
}

module.exports = getSessionExercise

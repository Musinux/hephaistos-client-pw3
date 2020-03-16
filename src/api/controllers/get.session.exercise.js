const accessRights = require('../../models/access-rights.definition.js')
const Exercise = require('../../models/exercise.model.js')
const Session = require('../../models/session.model.js')
const REGION_NOREAD = 0

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

  const exercise = await Exercise.findById(id, scope)
  if (!await Session.hasAccessRight(req.user, sessId, accessRights.module.edit)) {
    if (exercise.template_regions_rw) {
      exercise.template_regions = exercise.template_regions
        .filter((r, i) => exercise.template_regions_rw[i] !== REGION_NOREAD)
    }
  }
  res.json(exercise)
}

module.exports = getSessionExercise

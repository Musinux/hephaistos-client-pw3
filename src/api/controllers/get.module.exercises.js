const accessRights = require('../../models/access-rights.definition.js')
const Module = require('../../models/module.model.js')
const ModuleExercise = require('../../models/module-exercise.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function getModuleExercises (req, res) {
  const id = parseInt(req.params.id)
  if (!await Module.hasAccessRight(req.user, id, accessRights.module.participate)) {
    res.sendStatus(401)
    return
  }
  const scope = ['id', 'visible_to_participants', 'lang', 'title', 'difficulty', 'score']
  res.json(await ModuleExercise.getByModuleId(req.user, id, scope))
}

module.exports = getModuleExercises

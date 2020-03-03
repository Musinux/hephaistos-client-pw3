const accessRights = require('../../models/access-rights.definition.js')
const ModuleUserRole = require('../../models/module-user-role.model.js')
const Module = require('../../models/module.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function getModuleUsers (req, res) {
  const id = parseInt(req.params.id)
  if (!await Module.hasAccessRight(req.user, id, accessRights.module.edit)) {
    res.sendStatus(401)
    return
  }
  const scope = ['id', 'firstname', 'lastname', 'email', 'role']
  res.json(await ModuleUserRole.getByModuleId(id, scope))
}

module.exports = getModuleUsers

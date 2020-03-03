const accessRights = require('../../models/access-rights.definition.js')
const PlatformRole = require('../../models/platform-role.model.js')
const ModuleUserRole = require('../../models/module-user-role.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function addModuleUser (req, res) {
  const id = parseInt(req.params.id)
  const userId = parseInt(req.params.userId)
  const roleId = parseInt(req.body.roleId)
  if (!await PlatformRole.hasAccessRight(req.user, accessRights.module.edit_admin)) {
    res.sendStatus(401)
    return
  }
  if (isNaN(roleId)) {
    res.status(400)
      .send('`role` IS MISSING')
    return
  }
  res.json(await ModuleUserRole.add(id, userId, roleId))
}

module.exports = addModuleUser

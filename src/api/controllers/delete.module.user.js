const accessRights = require('../../models/access-rights.definition.js')
const PlatformRole = require('../../models/platform-role.model.js')
const ModuleUserRole = require('../../models/module-user-role.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function removeModuleUser (req, res) {
  const id = parseInt(req.params.id)
  const userId = parseInt(req.params.userId)

  if (!await PlatformRole.hasAccessRight(req.user, accessRights.module.edit_admin)) {
    res.sendStatus(401)
    return
  }
  res.json(await ModuleUserRole.remove(id, userId))
}

module.exports = removeModuleUser

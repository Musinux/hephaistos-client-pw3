const accessRights = require('../../models/access-rights.definition.js')
const ModuleUserRole = require('../../models/module-user-role.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function addModuleUser (req, res) {
  const id = parseInt(req.params.id)
  const userId = parseInt(req.params.userId)
  const roleId = parseInt(req.body.roleId)
  if (!req.user.hasGlobalAccessRight(accessRights.module.edit_admin)) {
    res.sendStatus(401)
    return
  }
  if (isNaN(roleId)) {
    res.status(400)
      .send('`roleId` IS MISSING')
    return
  }
  await ModuleUserRole.add(id, userId, roleId)
  res.json({ success: true })
}

module.exports = addModuleUser

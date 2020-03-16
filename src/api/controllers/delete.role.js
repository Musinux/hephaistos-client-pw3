const accessRights = require('../../models/access-rights.definition.js')
const Role = require('../../models/role.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function deleteRole (req, res) {
  const id = parseInt(req.params.id)
  if (!req.user.hasGlobalAccessRight(accessRights.role.manage)) {
    res.sendStatus(401)
    return
  }
  await Role.delete(id)
  res.json({ success: true })
}

module.exports = deleteRole

const accessRights = require('../../models/access-rights.definition.js')
const RoleAccessRight = require('../../models/role-access-right.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function removeAccessRightFromRole (req, res) {
  const id = parseInt(req.params.id)
  if (!req.user.hasGlobalAccessRight(accessRights.role.manage)) {
    res.sendStatus(401)
    return
  }
  const { right } = req.params
  await RoleAccessRight.remove(id, right)
  res.json({ success: true })
}

module.exports = removeAccessRightFromRole

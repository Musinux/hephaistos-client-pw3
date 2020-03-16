const accessRights = require('../../models/access-rights.definition.js')
const PlatformRole = require('../../models/platform-role.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function deleteUserRole (req, res) {
  const id = parseInt(req.params.id)
  if (!req.user.hasGlobalAccessRight(accessRights.role.add_to_user)) {
    res.sendStatus(401)
    return
  }

  await PlatformRole.remove(id)
  res.json({ success: true })
}

module.exports = deleteUserRole

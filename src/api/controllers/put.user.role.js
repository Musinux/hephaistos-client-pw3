const accessRights = require('../../models/access-rights.definition.js')
const PlatformRole = require('../../models/platform-role.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function putUserRole (req, res) {
  const id = parseInt(req.params.id)
  if (!req.user.hasGlobalAccessRight(accessRights.role.add_to_user)) {
    res.sendStatus(401)
    return
  }

  if (!req.body.roleId) {
    res.status(400)
      .send('`roleId` IS MISSING')
    return
  }
  await PlatformRole.add(id, req.body.roleId)
  res.json({ success: true })
}

module.exports = putUserRole

const accessRights = require('../../models/access-rights.definition.js')
const Role = require('../../models/role.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function putRole (req, res) {
  const id = parseInt(req.params.id)
  if (!req.user.hasGlobalAccessRight(accessRights.role.manage)) {
    res.sendStatus(401)
    return
  }
  const { name } = req.body
  await Role.update(id, name)
  res.json({ success: true })
}

module.exports = putRole

const accessRights = require('../../models/access-rights.definition.js')
const Role = require('../../models/role.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function postRole (req, res) {
  if (!req.user.hasGlobalAccessRight(accessRights.role.manage)) {
    res.sendStatus(401)
    return
  }
  const { name } = req.body
  const creationDate = new Date()
  res.json(await Role.create({ name, creation_date: creationDate }))
}

module.exports = postRole

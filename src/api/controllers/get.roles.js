const accessRights = require('../../models/access-rights.definition.js')
const Role = require('../../models/role.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function getRoles (req, res) {
  res.json(await Role.getAll())
}

module.exports = getRoles

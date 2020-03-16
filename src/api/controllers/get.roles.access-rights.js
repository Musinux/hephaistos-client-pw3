const Role = require('../../models/role.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function getRolesAccessRights (req, res) {
  res.json(await Role.getAllWithAccessRights())
}

module.exports = getRolesAccessRights

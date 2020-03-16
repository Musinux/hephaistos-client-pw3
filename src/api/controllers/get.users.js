const accessRights = require('../../models/access-rights.definition.js')
const User = require('../../models/user.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function getUsers (req, res) {
  const page = parseInt(req.query.page)
  const size = parseInt(req.query.size)
  if (!req.user.hasGlobalAccessRight(accessRights.user.view)) {
    res.sendStatus(401)
    return
  }
  const scope = ['id', 'email', 'firstname', 'lastname', 'role']
  res.json(await User.getAll(page, size, scope))
}

module.exports = getUsers

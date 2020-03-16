const accessRights = require('../../models/access-rights.definition.js')
const User = require('../../models/user.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function createUser (req, res) {
  if (!req.user.hasGlobalAccessRight(accessRights.user.manage)) {
    res.sendStatus(401)
    return
  }
  const user = req.body
  res.json(await User.create(user))
}

module.exports = createUser

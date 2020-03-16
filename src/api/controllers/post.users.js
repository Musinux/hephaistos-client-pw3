const accessRights = require('../../models/access-rights.definition.js')
const User = require('../../models/user.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function createUsers (req, res) {
  if (!req.user.hasGlobalAccessRight(accessRights.user.manage)) {
    res.sendStatus(401)
    return
  }
  const { users } = req.body
  res.json(await User.createMultiple(users))
}

module.exports = createUsers

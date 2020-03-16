const accessRights = require('../../models/access-rights.definition.js')
const User = require('../../models/user.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function putUser (req, res) {
  const id = parseInt(req.params.id)
  if (!req.user.hasGlobalAccessRight(accessRights.user.edit)) {
    res.sendStatus(401)
    return
  }
  res.json(await User.update(id, req.body))
}

module.exports = putUser

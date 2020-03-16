const accessRights = require('../../models/access-rights.definition.js')
const User = require('../../models/user.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function deleteUser (req, res) {
  const id = parseInt(req.params.id)
  if (!req.user.hasGlobalAccessRight(accessRights.user.delete)) {
    res.sendStatus(401)
    return
  }
  await User.delete(id)
  res.json({ success: true })
}

module.exports = deleteUser

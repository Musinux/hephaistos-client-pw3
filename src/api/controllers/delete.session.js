const accessRights = require('../../models/access-rights.definition.js')
const Session = require('../../models/session.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function deleteSession (req, res) {
  const id = parseInt(req.params.id)
  if (!await Session.hasAccessRight(req.user, id, accessRights.module.edit)) {
    res.sendStatus(401)
    return
  }
  await Session.delete(id)
  res.json({ success: true })
}

module.exports = deleteSession

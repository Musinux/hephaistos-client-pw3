const accessRights = require('../../models/access-rights.definition.js')
const Module = require('../../models/module.model.js')
const Session = require('../../models/session.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function putModuleReorderSessions (req, res) {
  const id = parseInt(req.params.id)
  if (!await Module.hasAccessRight(req.user, id, accessRights.module.edit)) {
    res.sendStatus(401)
    return
  }
  if (!Array.isArray(req.body.sessions)) {
    res.status(400)
      .send('sessions is not an array')
    return
  }
  await Session.updateSequenceIds(id, req.body.sessions)
  res.json({ success: true })
}

module.exports = putModuleReorderSessions

const accessRights = require('../../models/access-rights.definition.js')
const Module = require('../../models/module.model.js')
const Session = require('../../models/session.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function getModuleSessions (req, res) {
  const id = parseInt(req.params.id)
  if (!await Module.hasAccessRight(req.user, id, accessRights.module.participate)) {
    res.sendStatus(401)
    return
  }
  res.json(await Session.getByModuleId(id))
}

module.exports = getModuleSessions

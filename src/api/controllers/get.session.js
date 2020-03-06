const accessRights = require('../../models/access-rights.definition.js')
const Session = require('../../models/session.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function getSession (req, res) {
  const sessId = parseInt(req.params.id)
  if (!await Session.hasAccessRight(req.user, sessId, accessRights.module.participate)) {
    res.sendStatus(401)
    return
  }

  res.json(await Session.getById(sessId))
}

module.exports = getSession

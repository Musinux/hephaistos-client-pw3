const accessRights = require('../../models/access-rights.definition.js')
const Session = require('../../models/session.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function putUserRole (req, res) {
  const id = parseInt(req.params.id)
  if (!Session.hasAccessRight(req.user, id, accessRights.module.edit)) {
    res.sendStatus(401)
    return
  }

  if (!req.body.name) {
    res.status(400)
      .send('`name` IS MISSING')
    return
  }

  res.json(await Session.update(id, req.body.name))
}

module.exports = putUserRole

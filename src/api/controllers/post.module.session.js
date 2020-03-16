const accessRights = require('../../models/access-rights.definition.js')
const Module = require('../../models/module.model.js')
const Session = require('../../models/session.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function createModuleSession (req, res) {
  const id = parseInt(req.params.id)
  if (!await Module.hasAccessRight(req.user, id, accessRights.module.edit)) {
    res.sendStatus(401)
    return
  }
  const { name, sequence_id } = req.body
  const creationDate = new Date()
  res.json(await Session.create({
    module_id: id,
    sequence_id,
    name,
    creation_date: creationDate
  }))
}

module.exports = createModuleSession

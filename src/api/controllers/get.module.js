const accessRights = require('../../models/access-rights.definition.js')
const Module = require('../../models/module.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function getModule (req, res) {
  const id = parseInt(req.params.id)
  if (!await Module.hasAccessRight(req.user, id, accessRights.module.view)) {
    res.sendStatus(401)
    return
  }
  res.json(await Module.getById(id))
}

module.exports = getModule

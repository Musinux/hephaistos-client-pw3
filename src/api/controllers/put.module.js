const accessRights = require('../../models/access-rights.definition.js')
const Module = require('../../models/module.model.js')
const PlatformRole = require('../../models/platform-role.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function editModule (req, res) {
  const id = parseInt(req.params.id)
  if (!await PlatformRole.hasAccessRight(req.user, accessRights.module.edit_admin)) {
    res.sendStatus(401)
    return
  }
  const { name } = req.body
  res.json(await Module.update(id, { name }))
}

module.exports = editModule

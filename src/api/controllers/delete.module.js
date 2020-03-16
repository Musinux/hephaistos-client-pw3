const accessRights = require('../../models/access-rights.definition.js')
const Module = require('../../models/module.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function deleteModule (req, res) {
  const id = parseInt(req.params.id)

  if (!req.user.hasGlobalAccessRight(accessRights.module.edit_admin)) {
    res.sendStatus(401)
    return
  }
  await Module.delete(id)
  res.json({ success: true })
}

module.exports = deleteModule

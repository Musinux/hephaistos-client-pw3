const accessRights = require('../../models/access-rights.definition.js')
const Module = require('../../models/module.model.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function createModule (req, res) {
  if (!req.user.hasGlobalAccessRight(accessRights.module.create)) {
    res.sendStatus(401)
    return
  }
  const { name } = req.body
  const creationDate = new Date()
  res.json(await Module.create({ name, creation_date: creationDate }))
}

module.exports = createModule

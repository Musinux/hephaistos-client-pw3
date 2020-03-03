const Module = require('../../models/module.model.js')
// const debug = require('debug')('hephaistos:post.exercise.js')

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function getModules (req, res) {
  res.json(await Module.getMyModules(req.user))
}

module.exports = getModules

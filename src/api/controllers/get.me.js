/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function getMe (req, res) {
  res.json(req.user)
}

module.exports = getMe

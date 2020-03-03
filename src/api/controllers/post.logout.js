/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
async function postLogout (req, res) {
  req.logout()
  res.json({ success: true })
}

module.exports = postLogout

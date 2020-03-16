const router = require('express').Router()
const debug = require('debug')('hephaistos:routes.js')

const getMe = require('../controllers/get.me.js')
const postLogout = require('../controllers/post.logout.js')

const postExerciseSandbox = require('../controllers/post.exercise.sandbox.js')

const getModules = require('../controllers/get.modules.js')
const postModule = require('../controllers/post.module.js')
const putModule = require('../controllers/put.module.js')
const deleteModule = require('../controllers/delete.module.js')
const getModule = require('../controllers/get.module.js')
const getModuleExercises = require('../controllers/get.module.exercises.js')
const getModuleSessions = require('../controllers/get.module.sessions.js')
const putModuleReorderSessions = require('../controllers/put.module.reorder-sessions.js')

const getSession = require('../controllers/get.session.js')
const postModuleSession = require('../controllers/post.module.session.js')
const putSession = require('../controllers/put.session.js')
const deleteSession = require('../controllers/delete.session.js')

const getModuleUsers = require('../controllers/get.module.users.js')
const putModuleUser = require('../controllers/put.module.user.js')
const deleteModuleUser = require('../controllers/delete.module.user.js')

const getSessionExercises = require('../controllers/get.session.exercises.js')
const getSessionExercise = require('../controllers/get.session.exercise.js')
const deleteSessionExercise = require('../controllers/delete.session.exercise.js')
const putSessionReorderExercises = require('../controllers/put.session.reorder-exercises.js')
const postSessionExerciseAttempt = require('../controllers/post.session.exercise.attempt.js')
const getSessionExerciseLastAttempt = require('../controllers/get.session.exercise.last-attempt.js')
const postSessionExercise = require('../controllers/post.session.exercise.js')
const putSessionExercise = require('../controllers/put.session.exercise.js')
const putSessionExerciseMoveToSession = require('../controllers/put.session.exercise.move-to-session.js')

const getUsers = require('../controllers/get.users.js')
const postUsers = require('../controllers/post.users.js')
const postUser = require('../controllers/post.user.js')
const putUser = require('../controllers/put.user.js')
const deleteUser = require('../controllers/delete.user.js')
const putUserRole = require('../controllers/put.user.role.js')
const deleteUserRole = require('../controllers/delete.user.role.js')

const getRoles = require('../controllers/get.roles.js')
const postRole = require('../controllers/post.role.js')
const putRole = require('../controllers/put.role.js')
const deleteRole = require('../controllers/delete.role.js')
const getRolesAccessRights = require('../controllers/get.roles.access-rights.js')
const putRoleAccessRight = require('../controllers/put.role.access-right.js')
const deleteRoleAccessRight = require('../controllers/delete.role.access-right.js')

function isConnected (req, res, next) {
  if (req.user) {
    next()
    return
  }
  res.status(401).send({ error: 'Not authenticated' })
}

/** @param {import('passport')} passport */
function routes (passport) {
  router.post('/login', passport.authenticate('local'), errors(getMe))

  router.use(isConnected)
  router.post('/logout', errors(postLogout))

  router.get('/me', errors(getMe))

  router.post('/exercise/sandbox', errors(postExerciseSandbox))

  router.get('/modules', errors(getModules))
  router.post('/module', errors(postModule))
  router.get('/module/:id', errors(getModule))
  router.put('/module/:id', errors(putModule))
  router.delete('/module/:id', errors(deleteModule))

  router.get('/module/:id/exercises', errors(getModuleExercises))
  router.put('/module/:id/reorder-sessions', errors(putModuleReorderSessions))
  router.post('/module/:id/session', errors(postModuleSession))
  router.get('/module/:id/sessions', errors(getModuleSessions))
  router.get('/module/:id/users', errors(getModuleUsers))
  router.put('/module/:id/user/:userId', errors(putModuleUser))
  router.delete('/module/:id/user/:userId', errors(deleteModuleUser))

  router.get('/session/:id', errors(getSession))
  router.put('/session/:id', errors(putSession))
  router.put('/session/:id/reorder-exercises', errors(putSessionReorderExercises))
  router.delete('/session/:id', errors(deleteSession))

  router.get('/session/:id/exercises', errors(getSessionExercises))
  router.post('/session/:sessionId/exercise', errors(postSessionExercise))
  router.put('/session/:sessionId/exercise/:id', errors(putSessionExercise))
  router.put('/session/:sessionId/exercise/:id/move-to-session', errors(putSessionExerciseMoveToSession))
  router.get('/session/:sessionId/exercise/:id', errors(getSessionExercise))
  router.delete('/session/:sessionId/exercise/:id', errors(deleteSessionExercise))

  router.get('/session/:sessionId/exercise/:id/last-attempt',
    errors(getSessionExerciseLastAttempt))
  router.post('/session/:sessionId/exercise/:id/attempt',
    errors(postSessionExerciseAttempt))

  router.get('/session/:id/attempts', isConnected)
  router.post('/session/:id/attempt', isConnected)
  router.get('/session/:id/attempt/:attemptId', isConnected)
  router.delete('/session/:id/attempt/:attemptId', isConnected)

  router.get('/users', errors(getUsers))
  router.post('/users', errors(postUsers))
  router.post('/user', errors(postUser))
  router.get('/user/:id', isConnected)
  router.put('/user/:id', errors(putUser))
  router.put('/user/:id/role', errors(putUserRole))
  router.delete('/user/:id/role', errors(deleteUserRole))
  router.delete('/user/:id', errors(deleteUser))

  router.get('/roles', errors(getRoles))
  router.post('/role', errors(postRole))
  router.get('/roles/access-rights', errors(getRolesAccessRights))
  router.get('/role/:id', isConnected)
  router.put('/role/:id', errors(putRole))
  router.delete('/role/:id', errors(deleteRole))

  router.get('/role/:id/access-rights', isConnected)
  router.put('/role/:id/access-right', errors(putRoleAccessRight))
  router.delete('/role/:id/access-right/:right', errors(deleteRoleAccessRight))

  return router
}

/** @param {Function} fn */
function errors (fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next)
    } catch (err) {
      debug('Request errored', err)
      res.status(500).json({ error: err.message })
    }
  }
}

module.exports = routes

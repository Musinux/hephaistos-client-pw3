const router = require('express').Router()
const debug = require('debug')('hephaistos:routes.js')

const getMe = require('../controllers/get.me.js')
const postLogout = require('../controllers/post.logout.js')

const postExerciseSandbox = require('../controllers/post.exercise.sandbox.js')

const getModules = require('../controllers/get.modules.js')
const postModule = require('../controllers/post.module.js')
const putModule = require('../controllers/put.module.js')
const getModule = require('../controllers/get.module.js')
const getModuleExercises = require('../controllers/get.module.exercises.js')
const getModuleSessions = require('../controllers/get.module.sessions.js')

const getModuleUsers = require('../controllers/get.module.users.js')
const postModuleUser = require('../controllers/post.module.user.js')
const deleteModuleUser = require('../controllers/delete.module.user.js')

const getSessionExercises = require('../controllers/get.session.exercises.js')
const getSessionExercise = require('../controllers/get.session.exercise.js')
const postSessionExerciseAttempt = require('../controllers/post.session.exercise.attempt.js')
const getSessionExerciseLastAttempt = require('../controllers/get.session.exercise.last-attempt.js')
const postSessionExercise = require('../controllers/post.session.exercise.js')
const putSessionExercise = require('../controllers/put.session.exercise.js')
const getSession = require('../controllers/get.session.js')

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

  // router.get('/exercises', errors(getExercises))
  // router.post('/exercise', errors(postExercise))
  // router.get('/exercise/:id', errors(getExercise))
  router.post('/exercise/sandbox', errors(postExerciseSandbox))
  // router.put('/exercise/:id', errors(postExercise))
  // router.delete('/exercise/:id', isConnected)

  router.get('/modules', errors(getModules))
  router.post('/module', errors(postModule))
  router.get('/module/:id', errors(getModule))
  router.put('/module/:id', errors(putModule))
  router.delete('/module/:id', isConnected)

  router.get('/module/:id/exercises', errors(getModuleExercises))
  router.get('/module/:id/sessions', errors(getModuleSessions))
  router.get('/module/:id/users', errors(getModuleUsers))
  router.post('/module/:id/user/:userId', errors(postModuleUser))
  router.delete('/module/:id/user/:userId', errors(deleteModuleUser))

  router.get('/sessions', isConnected)
  router.post('/session', isConnected)
  router.get('/session/:id', errors(getSession))
  router.put('/session/:id', isConnected)
  router.delete('/session/:id', isConnected)

  router.get('/session/:id/exercises', errors(getSessionExercises))
  router.post('/session/:sessionId/exercise', errors(postSessionExercise))
  router.put('/session/:sessionId/exercise/:id', errors(putSessionExercise))
  router.get('/session/:sessionId/exercise/:id', errors(getSessionExercise))

  router.get('/session/:sessionId/exercise/:id/last-attempt', errors(getSessionExerciseLastAttempt))
  router.post('/session/:sessionId/exercise/:id/attempt', errors(postSessionExerciseAttempt))

  router.get('/session/:id/attempts', isConnected)
  router.post('/session/:id/attempt', isConnected)
  router.get('/session/:id/attempt/:attemptId', isConnected)
  router.delete('/session/:id/attempt/:attemptId', isConnected)

  router.get('/users', isConnected)
  router.get('/user/:id', isConnected)
  router.post('/user/:id', isConnected)
  router.delete('/user/:id', isConnected)

  router.get('/roles', isConnected)
  router.get('/role/:id', isConnected)
  router.post('/role/:id', isConnected)
  router.delete('/role/:id', isConnected)

  router.get('/role/:id/access_rights', isConnected)
  router.post('/role/:id/access_right', isConnected)
  router.delete('/role/:id/access_right/:id', isConnected)

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

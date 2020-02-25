const router = require('express').Router()
const debug = require('debug')('hephaistos:routes.js')
// const User = require('../../models/user.model.js')

const getExercise = require('../controllers/get.exercise.js')
const getExercises = require('../controllers/get.exercises.js')
const postExercise = require('../controllers/post.exercise.js')
const postExerciseSandbox = require('../controllers/post.exercise.sandbox.js')

function isConnected (req, res, next) {
  if (req.user) {
    next()
    return
  }
  res.status(401).send({ error: 'Not authenticated' })
}

/** @param {import('passport')} passport */
function routes (passport) {
  router.post('/login', passport.authenticate('local'), (req, res) => {
    res.json(req.user)
  })
  router.get('/me', isConnected, (req, res) => {
    res.json(req.user)
  })
  router.get('/exercises', isConnected, errors(getExercises))
  router.get('/exercise/:id', isConnected, errors(getExercise))
  router.post('/exercise/sandbox', isConnected, errors(postExerciseSandbox))
  router.post('/exercise/:id', isConnected, errors(postExercise))
  router.post('/exercise', isConnected, errors(postExercise))

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

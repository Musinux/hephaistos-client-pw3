const Exercise = require('./exercise.model.js')
const User = require('./user.model.js')
const Session = require('./session.model.js')
const SessionExercise = require('./session-exercise.model.js')
const Module = require('./module.model.js')
const ModuleExercise = require('./module-exercise.model.js')
const ExerciseAttempt = require('./exercise-attempt.model.js')
const ModuleUserRole = require('./module-user-role.model.js')
const PlatformRole = require('./platform-role.model.js')
const RoleAccessRight = require('./role-access-right.model.js')
const Role = require('./role.model.js')

module.exports = [
  Exercise, User,
  Module,
  Session, SessionExercise,
  ModuleExercise,
  ExerciseAttempt,
  Role, RoleAccessRight,
  ModuleUserRole,
  PlatformRole
]

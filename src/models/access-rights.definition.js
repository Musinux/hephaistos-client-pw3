/** eslint camelcase: 0 */
const accessRightsDefinition = {
  exercise: {
    view: 'exercise.view',
    do: 'execise.do'
  },
  session: {
    view: 'session.view',
    do: 'session.do'
  },
  module: {
    create: 'module.create',
    delete: 'module.delete',
    edit_admin: 'module.edit_admin',
    edit: 'module.edit',
    participate: 'module.participate',
    view: 'module.view'
  },
  exercise_attempt: {
    delete: 'exercise_attempt.delete'
  },
  user: {
    create: 'user.create',
    delete: 'user.delete',
    edit: 'user.edit',
    see_dashboard: 'user.see_dashboard'
  }
}

module.exports = accessRightsDefinition

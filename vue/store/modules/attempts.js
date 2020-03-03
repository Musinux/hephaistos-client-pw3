import axios from 'axios'
import config from '../../client.config'

/** @param {String} path */
function api (path) {
  return config.apiURL + path
}

const state = {
  lastAttemptResults: {},
  attempts: []
}

const getters = {
  getAttemptById: state => id => {
    return state.attempts.find(_ => _.id === parseInt(id))
  },

  getLastAttemptForExercise: state => exerciseId => {
    const found = state.attempts
      .filter(_ => _.exercise_id === parseInt(exerciseId))
      .sort((a, b) => b.id - a.id)
    return found.length ? found[0] : null
  }
}

const mutations = {
  setLastAttemptResults (state, { results }) {
    state.lastAttemptResults = results
  },
  addAttempt (state, { attempt, sessionId }) {
    const existing = state.attempts.findIndex(e => e.id === attempt.id)
    if (existing !== -1) {
      state.attempts[existing] = attempt
      state.attempts[existing].sessionId = parseInt(sessionId)
    } else {
      state.attempts.push(attempt)
      state.attempts[state.attempts.length - 1].sessionId = parseInt(sessionId)
    }
  }
}

const actions = {
  async fetchLastAttemptForExercise ({ commit }, { sessionId, exerciseId }) {
    commit('setLastAttemptResults', { results: {} })
    const url = '/session/' + sessionId + '/exercise/' + exerciseId + '/last-attempt'
    try {
      const { data } = await axios.get(api(url))
      commit('addAttempt', { attempt: data })
    } catch (err) {
      // if 404 error, ignore the error, if not, throw
      if (err.response.status !== 404) {
        throw err
      }
    }
  },

  async createAttemptForSession ({ commit }, { exerciseId, sessionId, solution }) {
    const url = '/session/' + sessionId + '/exercise/' + exerciseId + '/attempt'
    /** @type {import('../../../src/utils/HephaistosService').APIResult} */
    const results = (await axios.post(api(url), { solution })).data
    commit('setLastAttemptResults', { results: results.result })
    if (!results.result.stats.errors && !results.result.stats.failures) {
      commit('exercises/setValidated', { exerciseId }, { root: true })
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

import axios from 'axios'
import config from '../../client.config'

/** @param {String} path */
function api (path) {
  return config.apiURL + path
}

const state = {
  sessions: []
}

const getters = {
  getSessionById: state => id => {
    return state.sessions.find(_ => _.id === id)
  },

  getSessionsByModuleId: state => moduleId => {
    return state.sessions.filter(_ => _.moduleId === moduleId)
  }
}

const mutations = {
  addSession (state, { moduleId, session }) {
    const existing = state.sessions.findIndex(e => e.id === session.id)
    if (existing !== -1) {
      state.sessions[existing] = session
      state.sessions[existing].moduleId = moduleId
    } else {
      state.sessions.push(session)
      state.sessions[state.sessions.length - 1].moduleId = moduleId
    }
  },
  updateProp (state, { id, prop, value }) {
    const exo = state.getters.getSessionById(id)
    exo[prop] = value
  }
}

const actions = {
  async fetchSessionsForModule ({ commit }, { moduleId }) {
    const { data } = await axios.get(api('/module/' + moduleId + '/sessions'))
    data.forEach(d => commit('addSession', { moduleId, session: d }))
  },

  async fetchSession ({ commit }, { id }) {
    const { data } = await axios.get(api('/session/' + id))
    commit('addSession', { session: data })
  },

  async createSession ({ commit }, { session }) {
    const { data } = await axios.post(api('/session'), session)
    commit('addSession', { session: data })
  },

  async updateSession ({ commit }, { id, session }) {
    const { data } = await axios.post(api('/session/' + id), session)
    commit('addSession', data)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

import Vue from 'vue'
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

  getSessionsByModuleId: state => moduleId =>
    state.sessions.filter(_ => _.moduleId === moduleId)
      .sort((a, b) => a.sequence_id - b.sequence_id)
}

function updateProp (state, { id, prop, value }) {
  const exo = getters.getSessionById(state)(id)
  Vue.set(exo, prop, value)
}

const mutations = {
  addSession (state, { moduleId, session }) {
    const existing = state.sessions.findIndex(e => e.id === session.id)
    if (existing !== -1) {
      session.moduleId = moduleId
      const keys = Object.keys(session)
      for (const key of keys) {
        if (key === 'id') continue
        updateProp(state, { id: session.id, prop: key, value: session[key] })
      }
    } else {
      session.moduleId = moduleId
      state.sessions.push(session)
    }
  },
  deleteSession (state, { sessionId }) {
    const existing = state.sessions.findIndex(e => e.id === sessionId)
    if (existing !== -1) {
      state.sessions.splice(existing, 1)
    }
  },
  updateProp (state, { id, prop, value }) {
    updateProp(state, { id, prop, value })
  }
}

const actions = {
  async fetchSessionsForModule ({ commit }, { moduleId }) {
    const { data } = await axios.get(api('/module/' + moduleId + '/sessions'))
    data.forEach(d => commit('addSession', { moduleId, session: d }))
  },

  async fetchSession ({ commit }, { id }) {
    const { data } = await axios.get(api('/session/' + id))
    commit('addSession', { session: data, moduleId: data.module_id })
  },

  async createModuleSession ({ commit, state }, { moduleId, name }) {
    const sessions = getters.getSessionsByModuleId(state)(moduleId)
    let sequenceId = 1
    if (sessions.length) {
      sequenceId = sessions[sessions.length - 1].sequence_id
    }
    const { data } = await axios.post(api('/module/' + moduleId + '/session'), {
      name,
      sequence_id: sequenceId
    })
    commit('addSession', { session: data, moduleId })
    return data.id
  },

  async deleteSession ({ commit }, { sessionId }) {
    await axios.delete(api('/session/' + sessionId))
    commit('deleteSession', { sessionId })
  },

  async updateSessionsSequence ({ commit }, { moduleId, sessions }) {
    const newSessions = []
    sessions.forEach((s, i) => {
      if (i + 1 !== s.sequence_id) {
        newSessions.push({
          id: s.id,
          sequence_id: i + 1
        })
      }
    })
    await axios.put(api('/module/' + moduleId + '/reorder-sessions'), {
      sessions: newSessions
    })
    newSessions.forEach(s => commit('updateProp', {
      id: s.id,
      prop: 'sequence_id',
      value: s.sequence_id
    }))
  },

  async updateSession ({ commit, state }, { id, name }) {
    const { data } = await axios.put(api('/session/' + id), { name })
    const existingSession = state.sessions.find(e => e.id === id)
    if (existingSession) {
      data.module_id = existingSession.moduleId
      commit('addSession', { session: data, moduleId: existingSession.moduleId })
    } else {
      commit('addSession', { session: data, moduleId: null })
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

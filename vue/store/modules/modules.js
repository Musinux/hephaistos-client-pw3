import axios from 'axios'
import config from '../../client.config'

/** @param {String} path */
function api (path) {
  return config.apiURL + path
}

const state = {
  modules: []
}

const getters = {
  getModuleById: state => id => {
    return state.modules.find(_ => _.id === parseInt(id))
  }
}

const mutations = {
  addModule (state, module) {
    const existing = state.modules.findIndex(e => e.id === module.id)
    if (existing !== -1) {
      state.modules[existing] = module
    } else {
      state.modules.push(module)
    }
  }
}

const actions = {
  async fetchModules ({ commit }) {
    const { data } = await axios.get(api('/modules'))
    data.forEach(d => commit('addModule', d))
  },

  async fetchModule ({ commit }, { id }) {
    const { data } = await axios.get(api('/module/' + id))
    commit('addModule', data)
  },

  async createModule ({ commit }, { module }) {
    if (!module) {
      throw new Error('createModule shouldnt be called without parameters')
    }
    const { data } = await axios.post(api('/module'), module)
    commit('addModule', data)
  },

  async updateModule ({ commit }, { id, module }) {
    const { data } = await axios.post(api('/module/' + id), module)
    commit('addModule', data)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

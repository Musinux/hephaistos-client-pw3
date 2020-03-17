import Vue from 'vue'
import axios from 'axios'
import config from '../../client.config'
import accessRights from '../access-rights.definition.js'

/** @param {String} path */
function api (path) {
  return config.apiURL + path
}

const state = {
  roles: [{
    id: -1,
    name: 'NONE'
  }],
  accessRights
}

const getters = {
  getRoleNameById: state => id => {
    const role = state.roles.find(r => r.id === id)
    if (!role) return ''
    return role.name
  },
  getRoleById: state => id => {
    const role = state.roles.find(r => r.id === id)
    if (!role) return ''
    return role
  }
}

const mutations = {
  removeRole (state, { id }) {
    const existing = state.roles.findIndex(_ => _.id === id)
    if (existing !== -1) {
      state.roles.splice(existing, 1)
    }
  },
  addRole (state, role) {
    const existing = state.roles.findIndex(_ => _.id === role.id)
    if (existing !== -1) {
      state.roles[existing] = role
      const keys = Object.keys(role)
      for (const key of keys) {
        if (key === 'id') continue
        Vue.set(state.roles[existing], key, role[key])
      }
    } else {
      state.roles.push(role)
    }
  },
  setAccessRightOfRole (state, { roleId, right }) {
    const existing = state.roles.findIndex(_ => _.id === roleId)
    if (existing === -1) return
    if (!state.roles[existing].access_rights) {
      Vue.set(state.roles[existing], 'access_rights', [])
    }
    state.roles[existing].access_rights.push({ access_right: right })
  },
  unsetAccessRightOfRole (state, { roleId, right }) {
    const existing = state.roles.findIndex(_ => _.id === roleId)
    if (existing === -1) return
    if (!state.roles[existing].access_rights) return
    const idx = state.roles[existing].access_rights
      .findIndex(r => r.access_right === right)
    if (idx !== -1) {
      state.roles[existing].access_rights.splice(idx, 1)
    }
  },
  setRoleName (state, { roleId, name }) {
    const existing = state.roles.findIndex(_ => _.id === roleId)
    if (existing === -1) return
    state.roles[existing].name = name
  }
}

const actions = {
  async fetchRoles ({ commit }) {
    const { data } = await axios.get(api('/roles'))
    data.forEach(role => commit('addRole', role))
  },
  async createRole ({ commit }, { name }) {
    const { data } = await axios.post(api('/role'), { name })
    commit('addRole', data)
  },
  async deleteRole ({ commit }, { id }) {
    await axios.delete(api(`/role/${id}`))
    commit('removeRole', { id })
  },
  async fetchRolesWithAccessRights ({ commit }) {
    const { data } = await axios.get(api('/roles/access-rights'))
    data.forEach(role => commit('addRole', role))
  },
  async updateRoleName ({ commit }, { roleId, name }) {
    await axios.put(api('/role/' + roleId), { name })
    commit('setRoleName', { roleId, name })
  },
  async addAccessRightToRole ({ commit }, { roleId, right }) {
    await axios.put(api('/role/' + roleId + '/access-right'), { right })
    commit('setAccessRightOfRole', { roleId, right })
  },
  async removeAccessRightFromRole ({ commit }, { roleId, right }) {
    await axios.delete(api('/role/' + roleId + '/access-right/' + right))
    commit('unsetAccessRightOfRole', { roleId, right })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

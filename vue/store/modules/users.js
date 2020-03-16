import Vue from 'vue'
import axios from 'axios'
import config from '../../client.config'

/** @param {String} path */
function api (path) {
  return config.apiURL + path
}

const state = {
  users: [],
  moduleRoles: []
}

const getters = {
  getUserById: state => id => state.users.find(_ => _.id === id),
  getUsersByModuleId: state => id => state.moduleRoles.filter(_ => _.moduleId === id)
    .map(r => {
      const user = getters.getUserById(state)(r.userId)
      user.moduleRole = r.role
      return user
    }),
  getUserRoleByModuleId: state => (id, moduleId) => {
    const r = state.moduleRoles.find(_ => _.userId === id && _.moduleId === moduleId)
    if (r) return r.role
    return 0
  }
}
const mutations = {
  deleteUserRole (state, { userId }) {
    const user = getters.getUserById(state)(userId)
    if (user) {
      user.role = null
    }
  },
  updateUserRole (state, { userId, roleId }) {
    const user = getters.getUserById(state)(userId)
    if (user) {
      Vue.set(user, 'role', roleId)
      // user.role = roleId
    }
  },
  removeRoleForModule (state, { userId, moduleId }) {
    const modulerole = state.moduleRoles
      .findIndex(_ => _.userId === userId && _.moduleId === moduleId)
    if (modulerole !== -1) {
      state.moduleRoles.splice(modulerole, 1)
    }
  },
  addRoleForModule (state, { userId, moduleId, role }) {
    const modulerole = state.moduleRoles
      .find(_ => _.userId === userId && _.moduleId === moduleId)
    if (!modulerole) {
      state.moduleRoles.push({ userId, moduleId, role })
    } else {
      modulerole.role = role
    }
  },
  removeUser (state, { userId }) {
    const existing = state.users.findIndex(_ => _.id === userId)
    if (existing !== -1) {
      state.users.splice(existing, 1)
    }
  },
  addUser (state, { user }) {
    const existing = state.users.findIndex(_ => _.id === user.id)
    if (existing !== -1) {
      state.users[existing] = user
    } else {
      state.users.push(user)
    }
  }
}
const actions = {
  async createUser ({ commit }, { firstname, lastname, email }) {
    const { data } = await axios.post(api('/user'), { firstname, lastname, email })
    commit('addUser', { user: data })
  },
  async createUsers ({ commit }, { users }) {
    const { data } = await axios.post(api('/users'), { users })
    data.forEach(user => commit('addUser', { user }))
  },
  async fetchUsersOfModule ({ commit }, { moduleId }) {
    const { data } = await axios.get(api(`/module/${moduleId}/users`))
    data.forEach(user => {
      commit('addRoleForModule', { userId: user.id, moduleId, role: user.role })
      delete user.role
      commit('addUser', { user })
    })
  },
  async fetchUsers ({ commit }, { size, page }) {
    const { data } = await axios.get(api(`/users?size=${size}&page=${page}`))
    data.forEach(user => commit('addUser', { user }))
  },
  async updateUser ({ commit }, { userId, prop, value }) {
    const { data } = await axios.put(api(`/user/${userId}`), {
      [prop]: value
    })
    commit('addUser', { user: data })
  },
  async deleteUser ({ commit }, { userId, prop, value }) {
    await axios.delete(api(`/user/${userId}`))
    commit('removeUser', { userId })
  },
  async updateUserRoleForModule ({ commit, getters }, { moduleId, userId, roleId }) {
    await axios.put(api(`/module/${moduleId}/user/${userId}`), { roleId })
    commit('addRoleForModule', { userId, role: roleId, moduleId })
  },
  async deleteUserRoleForModule ({ commit, getters }, { moduleId, userId }) {
    await axios.delete(api(`/module/${moduleId}/user/${userId}`))
    commit('removeRoleForModule', { userId, moduleId })
  },
  async updateUserRoleForPlatform ({ commit, getters }, { userId, roleId }) {
    await axios.put(api(`/user/${userId}/role`), { roleId })
    commit('updateUserRole', { userId, roleId })
  },
  async deleteUserRoleForPlatform ({ commit, getters }, { userId }) {
    await axios.delete(api(`/user/${userId}/role`))
    commit('deleteUserRole', { userId })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

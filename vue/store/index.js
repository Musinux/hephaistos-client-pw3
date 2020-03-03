import Vue from 'vue'
import Vuex from 'vuex'
import exercisesStore from './modules/exercises'
import userStore from './modules/user'
import modulesStore from './modules/modules'
import sessionsStore from './modules/sessions'
import attemptsStore from './modules/attempts'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {},
  actions: {},
  mutations: {},
  getters: {},
  modules: {
    exercises: exercisesStore,
    user: userStore,
    modules: modulesStore,
    sessions: sessionsStore,
    attempts: attemptsStore
  }
})

import Vue from 'vue'
import axios from 'axios'
import config from '../../client.config'

/** @param {String} path */
function api (path) {
  return config.apiURL + path
}

const state = {
  exercises: []
}

const getters = {
  getExerciseById: state => id => {
    const found = state.exercises.find(_ => _.id === parseInt(id))
    return found
  },

  getExercisesBySessionId: state => sessionId => {
    const found = state.exercises.filter(_ => _.sessionId === sessionId)
      .sort((a, b) => a.sequence_id - b.sequence_id)
    return found
  }
}

function updateProp (state, { exercise, prop, value }) {
  if (typeof exercise[prop] === 'undefined') {
    Vue.set(exercise, prop, value)
  } else {
    exercise[prop] = value
  }
}

const mutations = {
  addExercise (state, { exercise, sessionId }) {
    const existing = state.exercises.findIndex(e => e.id === exercise.id)
    if (existing !== -1) { // we overlap objects to avoid loosing some props
      const keys = Object.keys(exercise)
      const currExo = state.exercises[existing]
      for (const key of keys) {
        updateProp(state, { exercise, prop: key, value: exercise[key] })
        if (typeof currExo[key] === 'undefined') {
          Vue.set(currExo, key, exercise[key])
        } else {
          currExo[key] = exercise[key]
        }
      }
    } else {
      state.exercises.push(exercise)
    }
    updateProp(state, { exercise, prop: 'sessionId', value: parseInt(sessionId) })
  },
  setValidated (state, { exerciseId }) {
    const exercise = state.exercises.find(e => e.id === exerciseId)
    updateProp(state, { exercise, prop: 'valid', value: true })
  }
}

const actions = {
  async fetchExerciseForSession ({ commit }, { sessionId, exerciseId }) {
    const url = '/session/' + sessionId + '/exercise/' + exerciseId
    const { data } = await axios.get(api(url))
    commit('addExercise', { sessionId, exercise: data })
  },
  async fetchExercisesForSession ({ commit }, { sessionId }) {
    const { data } = await axios.get(api('/session/' + sessionId + '/exercises'))
    data.forEach(d => commit('addExercise', { sessionId, exercise: d }))
  },

  async createExerciseForSession ({ commit, getters }, { exercise, sessionId }) {
    if (!exercise) {
      exercise = {
        instructions: '',
        title: '',
        tests: '',
        solution: '',
        lang: 'python',
        template_regions: [''],
        template_regions_rw: [0],
        difficulty: 0,
        score: 0,
        creation_date: new Date()
      }
      const exos = getters.getExercisesBySessionId(sessionId)
      exercise.sequence_id = exos.length
    }
    const url = api('/session/' + sessionId + '/exercise')
    const { data } = await axios.post(url, exercise)
    commit('addExercise', { sessionId, exercise: data })
    return data.id
  },

  async updateExerciseForSession ({ commit }, { id, sessionId, exercise }) {
    const url = api('/session/' + sessionId + '/exercise/' + id)
    const { data } = await axios.put(url, exercise)
    commit('addExercise', { exercise: data })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

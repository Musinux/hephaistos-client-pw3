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
  if (!exercise) return
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
      const currExo = state.exercises[existing]
      const keys = Object.keys(exercise)
      for (const key of keys) {
        updateProp(state, { exercise: currExo, prop: key, value: exercise[key] })
      }
    } else {
      state.exercises.push(exercise)
    }
    updateProp(state, { exercise, prop: 'sessionId', value: parseInt(sessionId) })
  },
  deleteExercise (state, { exerciseId }) {
    const existing = state.exercises.findIndex(e => e.id === exerciseId)
    if (existing !== -1) {
      state.exercises.splice(existing, 1)
    }
  },
  setValidated (state, { exerciseId }) {
    const exercise = state.exercises.find(e => e.id === exerciseId)
    updateProp(state, { exercise, prop: 'valid', value: true })
  },
  updateProp (state, { id, prop, value }) {
    const exercise = state.exercises.find(e => e.id === id)
    updateProp(state, { exercise, prop, value })
  },
  changeExerciseSessionId (state, { exerciseId, newSessionId, sequenceId }) {
    const exercise = state.exercises.find(e => e.id === exerciseId)
    const prevExos = getters.getExercisesBySessionId(state)(exercise.sessionId)
    const newExos = getters.getExercisesBySessionId(state)(newSessionId)
    prevExos.forEach(e => {
      if (e.sequence_id <= exercise.sequence_id) return
      e.sequence_id = e.sequence_id - 1
    })
    newExos.forEach(e => {
      if (e.sequence_id < sequenceId) return
      e.sequence_id = e.sequence_id + 1
    })
    exercise.sessionId = newSessionId
    exercise.sequence_id = sequenceId
  }
}

const actions = {
  async fetchExerciseForSession ({ commit }, { sessionId, exerciseId }) {
    if (typeof exerciseId !== 'number' || typeof sessionId !== 'number') return
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
  },

  async moveExerciseToSession ({ commit }, { id, currentSessionId, newSessionId, sequenceId }) {
    const url = api(`/session/${currentSessionId}/exercise/${id}/move-to-session`)
    await axios.put(url, { sequenceId, newSessionId })
    commit('changeExerciseSessionId', { exerciseId: id, newSessionId, sequenceId })
  },

  async updateExercisesSequence ({ commit }, { sessionId, exercises }) {
    const newExercises = []
    exercises.forEach((s, i) => {
      if (i + 1 !== s.sequence_id) {
        newExercises.push({
          id: s.id,
          sequence_id: i + 1
        })
      }
    })
    await axios.put(api('/session/' + sessionId + '/reorder-exercises'), {
      exercises: newExercises
    })
    newExercises.forEach(s => commit('updateProp', {
      id: s.id,
      prop: 'sequence_id',
      value: s.sequence_id
    }))
  },
  async deleteExerciseForSession ({ commit }, { sessionId, exerciseId }) {
    await axios.delete(api('/session/' + sessionId + '/exercise/' + exerciseId))
    commit('deleteExercise', { exerciseId })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

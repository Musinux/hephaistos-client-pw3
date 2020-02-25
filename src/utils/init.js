const PostgresStore = require('./PostgresStore.js')

async function run () {
  await PostgresStore.reset()
}

run()

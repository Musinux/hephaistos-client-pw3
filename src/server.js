const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const session = require('express-session')
const passport = require('passport')
const debug = require('debug')('hephaistos:server.js')
const cors = require('cors')

const config = require('./server.config.js')
const PostgresStore = require('./utils/PostgresStore.js')
const PgSession = require('connect-pg-simple')(session)

PostgresStore.init()
  .then(() => debug('connected to postgres'))
  .catch(err => {
    console.error('Unable to connect to postgres. Exiting.', err)
    process.exit(1)
  })

var app = express()

app.use(logger('dev'))
app.use(cors({
  credentials: true,
  origin: config.WEB_CLIENT_URL || 'http://localhost:8080'
}))
app.use(session({
  store: new PgSession({
    pool: PostgresStore.pool
  }),
  secret: config.SESSION_SECRET,
  resave: false
}))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

const apiRouter = require('./api/routes/routes.js')
const User = require('./models/user.model.js')

User.preparePassport(passport)

app.use(passport.initialize())
app.use(passport.session())

app.use('/api/v1/', apiRouter(passport))

const port = process.env.PORT || config.PORT || 8082
app.listen(port, () => {
  console.log(`server started at localhost:${port}`)
})

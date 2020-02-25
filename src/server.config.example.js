module.exports = {
  PORT: 3000,
  HEPHAISTOS_URL: 'http://localhost:5000',
  ADMIN_EMAIL: 'admin@example.com',
  ADMIN_FIRSTNAME: 'Prénom',
  ADMIN_LASTNAME: 'NOM',
  SESSION_SECRET: 'randomsessionsecret',
  postgres: {
    user: 'hephaistos',
    host: 'localhost',
    database: 'hephaistos',
    password: 'YOUR_DATABASE_PASSWORD'
  }
}

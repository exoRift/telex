const path = require('path')

if (!process.env.NODE_ENV) require('dotenv').config()

const {
  DATABASE_URL,
  DATABASE_CLIENT
} = process.env

module.exports = {
  client: DATABASE_CLIENT,
  connection: DATABASE_URL,
  migrations: {
    directory: path.join(__dirname, 'db/migrations')
  }
}

const {
  TOKEN,
  DATABASE_URL
} = process.env

const Eris = require('Eris')
const {
  Agent
} = require('cyclone-engine')

const data = require('data')
const databaseTables = require('data/tables.json')

const agent = new Agent({
  Eris,
  token: TOKEN,
  chData: data,
  databaseOptions: {
    connectionURL: DATABASE_URL,
    client: 'pg',
    tables: databaseTables
  },
  agentOptions: {

  }
})

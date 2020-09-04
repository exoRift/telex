const Eris = require('eris')
const Knex = require('knex')

const knexConfig = require('../../knexfile.js')

const {
  routines
} = require('./util/')

const {
  TOKEN,
  REST_LIMIT
} = process.env

const knex = new Knex(knexConfig)

const client = new Eris(TOKEN, {
  restMode: true
})

client.getRESTGuilds(REST_LIMIT)
  .then((guilds) => routines.pruneDB(client, knex, guilds))
  .then(() => process.exit())

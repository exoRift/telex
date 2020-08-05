const Eris = require('eris')
const Knex = require('knex')

const {
  routines
} = require('../data/util/')

const {
  TOKEN,
  DATABASE_URL,
  REST_LIMIT
} = process.env

const knex = new Knex({
  client: 'pg',
  connection: DATABASE_URL,
  pool: {
    min: 1,
    max: 1
  }
})

const client = new Eris(TOKEN, {
  restMode: true
})

client.getRESTGuilds(REST_LIMIT).then((guilds) => routines.pruneDB(client, knex, guilds))

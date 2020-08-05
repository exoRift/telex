const Eris = require('eris')
const Knex = require('knex')
const {
  Agent
} = require('cyclone-engine')
const DBL = require('dblapi.js')

const commands = require('./src/data/commands/')

const {
  routines
} = require('./src/data/util/')

const {
  onMessage,
  onGuildUpdate,
  onGuildDelete,
  onChannelUnavailable,
  statusMessage
} = require('./src/data/listeners/')

const {
  TOKEN,
  DATABASE_URL,
  DBL_TOKEN,
  PREFIX
} = process.env

const knex = new Knex({
  client: 'pg',
  connection: DATABASE_URL,
  pool: {
    min: 1,
    max: 1
  }
})

const permissionQuery = knex('guilds')
  .select('id', 'adminrole')
  .then((data) => data.reduce((acc, { id, adminrole }) => {
    acc[id] = {
      permissions: {
        [adminrole]: 1
      }
    }

    return acc
  }, {}))

const agent = new Agent({
  Eris,
  token: TOKEN,
  handlerData: {
    commands,
    reactCommands: [],
    options: {
      prefix: PREFIX
    }
  },
  options: {
    guildOptions: {
      permissions: permissionQuery
    },
    postEventFunctions: {
      message: (msg, res) => onMessage.call(agent, msg, res)
    },
    statusMessage
  }
})

const dbl = new DBL(DBL_TOKEN)

agent.attach('db', knex)
agent.attach('dbl', dbl)
for (const routine in routines) agent.attach(routine, routines[routine].bind(agent))

agent.client.on('guildUpdate', onGuildUpdate.bind(agent))
agent.client.on('guildDelete', onGuildDelete.bind(agent))
agent.client.on('guildRoleUpdate', onChannelUnavailable.bind(agent))
agent.client.on('guildRoleCreate', onChannelUnavailable.bind(agent))
agent.client.on('guildRoleDelete', onChannelUnavailable.bind(agent))
agent.client.on('channelUpdate', (channel) => onChannelUnavailable.call(agent, channel.guild))
agent.client.on('channelDelete', (channel) => onChannelUnavailable.call(agent, channel.guild))

agent.connect().then(() => setTimeout(agent.attachments.initPrune, 10000))

const Eris = require('eris')
const Knex = require('knex')
const {
  Agent
} = require('cyclone-engine')
const DBL = require('dblapi.js')

const knexConfig = require('./knexfile.js')
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
  DBL_TOKEN,
  PREFIX
} = process.env

const knex = new Knex(knexConfig)

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
    intents: ['guildPresences'],
    guildOptions: permissionQuery,
    postEventFunctions: {
      message: async (msg, res) => onMessage(agent.client, knex, msg, res, await agent.getTopPermissionLevel(msg.member))
    },
    statusMessage
  }
})

const dbl = new DBL(DBL_TOKEN)

agent.attach('db', knex)
agent.attach('dbl', dbl)
for (const routine in routines) agent.attach(routine, routines[routine])

agent.client.on('guildUpdate', (guild, oldGuild) => onGuildUpdate(knex, guild, oldGuild))
agent.client.on('guildDelete', (guild) => onGuildDelete(agent.client, knex, guild))
agent.client.on('guildRoleUpdate', (guild) => onChannelUnavailable(agent.client, knex, guild))
agent.client.on('guildRoleCreate', (guild) => onChannelUnavailable(agent.client, knex, guild))
agent.client.on('guildRoleDelete', (guild) => onChannelUnavailable(agent.client, knex, guild))
agent.client.on('channelUpdate', (channel) => onChannelUnavailable(agent.client, knex, channel.guild))
agent.client.on('channelDelete', (channel) => onChannelUnavailable(agent.client, knex, channel.guild))

agent.connect().then(() => setTimeout(() => dbl.postStats(agent.client.guilds.size), 10000))

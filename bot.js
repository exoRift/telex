const {
  TOKEN,
  DATABASE_URL,
  DBL_TOKEN,
  PREFIX
} = process.env

const Eris = require('eris')
const Knex = require('knex')
const {
  Agent
} = require('cyclone-engine')
const DBL = require('dblapi.js')

const commands = require('./src/data/commands/')

const {
  transmit,
  buildPanel,
  compileMessage,
  getValidChannel,
  deleteRoom
} = require('./src/data/utils/')

const {
  onGuildUpdate,
  onGuildDelete,
  onChannelUnavailable
} = require('./src/data/listeners/')

const knex = new Knex({
  client: 'pg',
  connection: DATABASE_URL,
  pool: {
    min: 1,
    max: 1
  }
})

const permQuery = knex('guilds')
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
      permissions: permQuery
    },
    postEventFunctions: {
      message: (msg, res) => {
        if (res && res.command) console.log(`${msg.timestamp} - **${msg.author.username}** > *${res.command.name || 'AWAIT'}*`)
        else if ((msg.content || msg.attachments.length) && !msg.type) {
          compileMessage.call(agent, msg)
            .then(agent.attachments.transmit)
            .catch((ignore) => ignore)
        }
      }
    },
    statusMessage: (editStatus, agent) => {
      let status = false

      function setStatus () {
        if (!status) {
          agent.attachments.db('rooms')
            .count()
            .then(([{ count }]) => editStatus({
              name: 'Rooms: ' + count
            }))
        } else {
          editStatus({
            name: `Prefix: '${PREFIX}'`,
            type: 2
          })
        }
      }

      setInterval(() => {
        status = !status

        setStatus()
      }, 300000)

      setStatus()
    }
  }
})

const dbl = new DBL(DBL_TOKEN)

agent.attach('db', knex)
agent.attach('dbl', dbl)
agent.attach('transmit', transmit.bind(agent))
agent.attach('buildPanel', buildPanel.bind(agent))
agent.attach('getValidChannel', getValidChannel.bind(agent))
agent.attach('deleteRoom', deleteRoom.bind(agent))

agent.client.on('guildUpdate', onGuildUpdate.bind(agent))
agent.client.on('guildDelete', onGuildDelete.bind(agent))
agent.client.on('guildRoleUpdate', onChannelUnavailable.bind(agent))
agent.client.on('guildRoleCreate', onChannelUnavailable.bind(agent))
agent.client.on('guildRoleDelete', onChannelUnavailable.bind(agent))
agent.client.on('channelUpdate', (channel) => onChannelUnavailable.call(agent, channel.guild))
agent.client.on('channelDelete', (channel) => onChannelUnavailable.call(agent, channel.guild))

agent.connect().then(() => {
  setTimeout(() => {
    dbl.postStats(agent.client.guilds.size)

    console.log('Initiating Prune')

    knex('guilds')
      .select(['id', 'channel'])
      .then((res) => {
        for (const guildData of res) {
          const guild = agent.client.guilds.get(guildData.id)

          if (guild) onChannelUnavailable.call(agent, guild)
          else {
            guildData.name = 'deleted-guild'

            onGuildDelete.call(agent, guildData)
          }
        }
      })
  }, 10000) // Ready event fires when not all guilds have been fetched yet. Waiting for fix
})

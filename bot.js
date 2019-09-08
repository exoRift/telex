const {
  TOKEN,
  DATABASE_URL,
  DBL_TOKEN,
  PREFIX
} = process.env

const Eris = require('eris')
const {
  Agent
} = require('cyclone-engine')

const data = require('./src/data/')
const databaseTables = require('./src/data/tables.json')

const {
  transmit,
  buildPanel,
  compileMessage
} = require('./src/data/utils.js')

const {
  onGuildUpdate,
  onGuildDelete,
  onChannelUnavailable
} = require('./src/data/listenerFunctions/')

const agent = new Agent({
  Eris,
  token: TOKEN,
  handlerData: data,
  databaseOptions: {
    connectionURL: DATABASE_URL,
    client: 'pg',
    tables: databaseTables
  },
  agentOptions: {
    prefix: PREFIX,
    dblToken: DBL_TOKEN,
    postMessageFunction: (msg, res) => {
      if (res && res.command) console.log(`${msg.timestamp} - **${msg.author.username}** > *${res.command.name || res.command._id}*`)
      else if ((msg.content || msg.attachments.length) && !msg.type) {
        compileMessage.call(agent, msg)
          .then(agent.transmit)
          .catch((ignore) => ignore)
      }
    },
    statusMessage: (editStatus, agent) => {
      let status = false

      function setStatus () {
        if (status) {
          agent._knex.count('rooms').then((rooms) => {
            editStatus({
              name: 'Rooms: ' + rooms
            })
          })
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
agent.transmit = transmit.bind(agent)
agent.buildPanel = buildPanel.bind(agent)

agent._client.on('guildUpdate', onGuildUpdate.bind(agent))
agent._client.on('guildDelete', onGuildDelete.bind(agent))
agent._client.on('guildRoleUpdate', onChannelUnavailable.bind(agent))
agent._client.on('guildRoleCreate', onChannelUnavailable.bind(agent))
agent._client.on('guildRoleDelete', onChannelUnavailable.bind(agent))
agent._client.on('channelUpdate', (channel) => onChannelUnavailable.call(agent, channel.guild))
agent._client.on('channelDelete', (channel) => onChannelUnavailable.call(agent, channel.guild))

agent.connect().then(() => {
  setTimeout(() => {
    agent._knex.select({
      table: 'guilds',
      columns: ['id', 'channel']
    }).then((guilds) => {
      for (const guildData of guilds) {
        const guild = agent._client.guilds.get(guildData.id)

        if (!guild) {
          guildData.name = 'deleted-guild'
          onGuildDelete.call(agent, guildData)
        } else onChannelUnavailable.call(agent, guild)
      }
    })
  }, 5000)
})

const {
  TOKEN,
  DATABASE_URL,
  DBL_TOKEN,
  PREFIX
} = process.env

const Eris = require('eris')
const { Agent } = require('cyclone-engine')

const data = require('./src/data')
const databaseTables = require('./src/data/tables.json')

const {
  transmit,
  compileMessage
} = require('./src/data/utils.js')

const {
  onGuildUpdate,
  onGuildDelete,
  onChannelUnavailable
} = require('./src/data/listenerFunctions')

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
    prefix: PREFIX,
    dblToken: DBL_TOKEN,
    postMessageFunction: (msg, res) => {
      if (res && res.command) {
        console.log(`${msg.timestamp} - **${msg.author.username}** > *${res.command.name}*`)
      } else if ((msg.content || msg.attachments.length) && !msg.type) {
        compileMessage.call(agent, msg)
          .then(agent.transmit)
          .catch((ignore) => ignore)
      }
    }
  }
})
agent.transmit = transmit.bind(agent)

agent._client.on('guildUpdate', onGuildUpdate.bind(agent))
agent._client.on('guildDelete', onGuildDelete.bind(agent))
agent._client.on('guildRoleUpdate', onChannelUnavailable.bind(agent))
agent._client.on('guildRoleCreate', onChannelUnavailable.bind(agent))
agent._client.on('guildRoleDelete', onChannelUnavailable.bind(agent))
agent._client.on('channelUpdate', (channel) => onChannelUnavailable.call(agent, channel.guild))
agent._client.on('channelDelete', (channel) => onChannelUnavailable.call(agent, channel.guild))

agent.connect().then(() => {
  agent._knex.select({
    table: 'guilds',
    columns: ['id', 'channel']
  }).then((guilds) => {
    const deletedGuilds = guilds.reduce((a, g) => {
      const guild = agent._client.guilds.get(g.id)
      if (!guild) a.push(g.id)
      else if (!guild.channels.get(g.channel) || !guild.channels.get(g.channel).permissionsOf(agent._client.user.id).has('sendMessages')) {
        agent._knex.update({
          table: 'guilds',
          where: {
            id: g.id,
            data: {
              channel: g.channels.find((c) => c.permissionsOf(agent._client.user.id).has('sendMessages') && !c.type).id
            }
          }
        })
      }

      return a
    }, [])

    if (deletedGuilds) {
      agent._knex.delete({
        table: 'guilds',
        where: (builder) => builder.whereIn('id', deletedGuilds)
      })
    }
  })
})

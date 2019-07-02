const {
  TOKEN,
  DATABASE_URL,
  DBL_TOKEN,
  PREFIX
} = process.env

const Eris = require('Eris')
const {
  Agent
} = require('cyclone-engine')

const data = require('./src/data')
const databaseTables = require('./src/data/tables.json')

const {
  transmit
} = require('./src/data/utils.js')

const {
  onGuildUpdate
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
    logFunction: (msg, { command }) => `${msg.timestamp} - **${msg.author.username}** > *${command.name}*`
  }
})
agent.transmit = transmit

agent._client.on('guildUpdate', onGuildUpdate.bind(this, agent))

agent.connect()

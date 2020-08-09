const {
  Command
} = require('cyclone-engine')
const {
  assets
} = require('../util/')

const data = {
  name: 'ping',
  desc: 'Check if the bot is online, display the bot\'s ping in ms, and view the amount of servers the bot\'s in',
  action: ({ agent, msg }) => {
    const shard = msg.channel.type ? agent.client.shards.get(0) : msg.channel.guild.shard
    const clientLatency = Date.now() - msg.timestamp
    return {
      embed: {
        author: {
          name: 'Ping',
          icon_url: assets.ping
        },
        title: 'Bot Status',
        description: `Pong! Client: **${clientLatency}ms** API: **${shard.latency}ms** | Servers: **${agent.client.guilds.filter((g) => g.shard.id === shard.id).length}**`,
        color: clientLatency > 200 && clientLatency < 300 ? 0xFFFF00 : clientLatency > 300 ? 0xF32125 : 0x1B207
      }
    }
  }
}

module.exports = new Command(data)

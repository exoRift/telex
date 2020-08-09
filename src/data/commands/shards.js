const {
  Command
} = require('cyclone-engine')

const {
  emojis,
  assets
} = require('../util/')

const data = {
  name: 'shards',
  desc: 'View all shard latencies',
  action: ({ agent, msg }) => {
    const latencies = agent.client.shards.map((s) => s.latency)
    const latencyAverage = latencies.reduce((a, l) => a + l, 0) / latencies.length
    const fields = agent.client.shards.map((shard) => {
      return {
        name: `${!msg.channel.type && shard.id === msg.channel.guild.shard.id ? '*' : ''}Shard ${shard.id}`,
        value: `${shard.ready ? emojis.online : emojis.dnd} ${shard.ready ? shard.latency : 'OFFLINE'}ms`,
        inline: true
      }
    })

    return {
      embed: {
        author: {
          name: 'Latencies',
          icon_url: assets.ping
        },
        color: latencyAverage > 200 && latencyAverage < 300 ? 0xFFFF00 : latencyAverage > 300 ? 0xF32125 : 0x1B207,
        fields,
        footer: {
          text: `Average ping is ${latencyAverage}ms`
        }
      }
    }
  }
}

module.exports = new Command(data)

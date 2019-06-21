const {
  Command
} = require('cyclone-engine')

const {
  links,
  statusEmojis
} = require('../utils.js')

const data = {
  name: 'shards',
  desc: 'View all shard latencies',
  action: ({ client, msg }) => {
    const latencies = client.shards.map((s) => s.latency)
    const latencyAverage = latencies.reduce((a, e) => a + e, 0) / latencies.length
    const fields = client.shards.map((shard) => {
      return {
        name: `${msg.channel.type === 0 && shard.id === msg.channel.guild.shard.id ? '*' : ''}Shard ${shard.id}`,
        value: `${shard.ready ? statusEmojis.online : statusEmojis.dnd} ${shard.ready ? shard.latency : 'OFFLINE'}ms`,
        inline: true
      }
    })

    return {
      embed: {
        color: latencyAverage > 200 && latencyAverage < 300 ? 16776960 : latencyAverage > 300 ? 15933733 : 111111,
        author: {
          name: 'Latencies',
          icon_url: links.pingIcon
        },
        footer: {
          text: `Average ping is ${latencyAverage}ms`
        },
        fields
      }
    }
  }
}

module.exports = new Command(data)

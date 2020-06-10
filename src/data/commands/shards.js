const {
  Command
} = require('cyclone-engine')

const statuses = require('../utils/emojis.json')

const data = {
  name: 'shards',
  desc: 'View all shard latencies',
  action: ({ agent, msg }) => {
    const latencies = agent.client.shards.map((s) => s.latency)
    const latencyAverage = latencies.reduce((a, l) => a + l, 0) / latencies.length
    const fields = agent.client.shards.map((shard) => {
      return {
        name: `${!msg.channel.type && shard.id === msg.channel.guild.shard.id ? '*' : ''}Shard ${shard.id}`,
        value: `${shard.ready ? statuses.online : statuses.dnd} ${shard.ready ? shard.latency : 'OFFLINE'}ms`,
        inline: true
      }
    })

    return {
      embed: {
        author: {
          name: 'Latencies',
          icon_url: 'https://raw.githubusercontent.com/exoRift/telex/master/assets/Ping.png'
        },
        color: latencyAverage > 200 && latencyAverage < 300 ? 16776960 : latencyAverage > 300 ? 15933733 : 111111,
        fields,
        footer: {
          text: `Average ping is ${latencyAverage}ms`
        }
      }
    }
  }
}

module.exports = new Command(data)

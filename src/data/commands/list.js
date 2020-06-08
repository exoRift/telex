const {
  Command
} = require('cyclone-engine')

const data = {
  name: 'list',
  desc: 'List all the guilds in your room and their abbreviations',
  options: {
    guildOnly: true
  },
  action: async ({ agent, msg }) => {
    const currentGuildSubquery = agent.attachments.db('guilds')
      .select('room')
      .where('id', msg.channel.guild.id)

    const guilds = await agent.attachments.db('guilds')
      .select(['id', 'room', 'abbreviation'])
      .where('room', 'in', currentGuildSubquery)

    if (!guilds.length) return '`You are not currently in a room.`'

    const [room] = await agent.attachments.db('rooms')
      .select(['name', 'owner'])
      .where('name', guilds.find((g) => g.id === msg.channel.guild.id).room)

    return '```\n' +
      guilds.reduce((a, g) => `${a}${(g.id === room.owner ? '👑 ' : '')}${agent.client.guilds.get(g.id).name} - ${g.abbreviation}\n`, '') +
      '```'
  }
}

module.exports = new Command(data)

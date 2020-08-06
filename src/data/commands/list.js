const {
  Command
} = require('cyclone-engine')

const data = {
  name: 'list',
  desc: 'List all the guilds in your room and their abbreviations',
  options: {
    guildOnly: true,
    guide: {
      color: 2303520,
      fields: [{
        name: 'See who\'s in your room',
        value: 'Lost track of which guilds are in your cool kidz corner? Don\'t know which guild a callsign belongs to?\nList the names and callsigns of the guilds in the room you\'re in\nThe guild that owns the room will have a crown'
      }]
    }
  },
  action: async ({ agent, msg }) => {
    const currentGuildSubquery = agent.attachments.db('guilds')
      .select('room')
      .where('id', msg.channel.guild.id)

    const guilds = await agent.attachments.db('guilds')
      .select(['id', 'room', 'callsign'])
      .where('room', 'in', currentGuildSubquery)

    if (!guilds.length) return '`You are not currently in a room`'

    const [roomData] = await agent.attachments.db('rooms')
      .select(['name', 'owner'])
      .where('name', guilds.find((g) => g.id === msg.channel.guild.id).room)

    return '```\n' +
      guilds.reduce((a, g) => `${a}${(g.id === roomData.owner ? '👑 ' : '')}${agent.client.guilds.get(g.id).name} - ${g.callsign}\n`, '') +
      '```'
  }
}

module.exports = new Command(data)

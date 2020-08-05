const {
  Command
} = require('cyclone-engine')

const data = {
  name: 'room',
  desc: 'Open the room management panel',
  options: {
    guildOnly: true,
    authLevel: 1
  },
  action: ({ agent, msg }) => {
    return agent.attachments.db('guilds')
      .select('room')
      .where('id', msg.channel.guild.id)
      .then(async ([guildData]) => {
        if (guildData) return agent.attachments.buildPanel(guildData.room, msg.channel.guild.id)
        else return '`You are not currently in a room. Create one with the create command`'
      })
  }
}

module.exports = new Command(data)

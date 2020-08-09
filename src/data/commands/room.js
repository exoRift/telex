const {
  Command
} = require('cyclone-engine')

const data = {
  name: 'room',
  desc: 'Open the room management panel',
  options: {
    guildOnly: true,
    authLevel: 1,
    guide: {
      color: 0x277BC,
      fields: [{
        name: 'Room management',
        value: 'Manage your guild settings or the room settings if you own it\n\nTransmission Channel: The channel where messages are exchanged between your guild and the rest of the room\nAdmin Role: Anyone with this roll can open and use the management panel\nCallsign: An abbreviation displayed next to the transmitted messages of your guild members that identifies where they\'re speaking from'
      }]
    }
  },
  action: ({ agent, msg }) => {
    return agent.attachments.db('guilds')
      .select('room')
      .where('id', msg.channel.guild.id)
      .then(async ([guildData]) => {
        if (guildData) return agent.attachments.buildPanel(agent.client, agent.attachments.db, guildData.room, msg.channel.guild.id)
        else return '`You are not currently in a room. Create one with the create command or join an existing one`'
      })
  }
}

module.exports = new Command(data)

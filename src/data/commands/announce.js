const {
  Command
} = require('cyclone-engine')

const {
  alerts
} = require('../util/')

const data = {
  name: 'announce',
  desc: 'Send a highlighted message to every guild in your room',
  options: {
    args: [{ name: 'announcement', mand: true }],
    guildOnly: true,
    authLevel: 1
  },
  action: async ({ agent, msg, args: [announcement], triggerResponse }) => {
    await msg.delete()

    const [guildData] = await agent.attachments.db('guilds')
      .select('room')
      .where('id', msg.channel.guild.id)

    if (guildData) {
      const [roomData] = await agent.attachments.db('rooms')
        .select('owner')
        .where('name', guildData.room)

      if (msg.channel.guild.id === roomData.owner) {
        await agent.attachments.transmit(agent.client, agent.attachments.db, { room: guildData.room, msg: alerts.announce({ guildName: msg.channel.guild.name, content: announcement }) })
      } else return `\`You do not own ${guildData.room}\``
    } else return '`You are not currently in a room`'
  }
}

module.exports = new Command(data)

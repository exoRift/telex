const {
  Command
} = require('cyclone-engine')

const {
  alerts
} = require('../util/')

const data = {
  name: 'kick',
  desc: 'Kick a guild from your room',
  options: {
    args: [{ name: 'guild', mand: true }],
    guildOnly: true,
    authLevel: 1,
    guide: {
      color: 11037490,
      value: [{
        name: 'Punish the troublemakers',
        value: 'Don\'t like a certain guild anymore? Kick them from your room with this command'
      }]
    }
  },
  action: async ({ agent, msg, args: [guildName] }) => {
    const target = agent.client.guilds.find((g) => g.name.toLowerCase() === guildName.toLowerCase())

    if (target) {
      const guilds = await agent.attachments.db('guilds')
        .select('room')
        .where('id', msg.channel.guild.id)
        .andWhere('id', target.id)

      const guildData = guilds.find((g) => g.id === msg.channel.guild.id)
      const targetData = guilds.find((g) => g.id === target.id)

      if (guildData) {
        const [roomData] = await agent.attachments.db('rooms')
          .select('owner')
          .where('name', guildData.room)

        if (msg.channel.guild.id === roomData.owner) {
          if (targetData) {
            await agent.attachments.transmit(agent.client, agent.attachments.db, { room: guildData.room, msg: alerts.kick({ guildName: target.name }) })

            await agent.attachments.db('guilds')
              .delete()
              .where('id', target.id)

            return target.name + ' was kicked from your room'
          } else return `\`${target.name} is not in your room\``
        } else return `\`You do not own ${guildData.room}\``
      } else return '`You are not currently in a room`'
    } else return `\`Could not find a guild named "${guildName}"\``
  }
}

module.exports = new Command(data)

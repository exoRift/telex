const {
  Command,
  ReactCommand,
  ReactInterface
} = require('cyclone-engine')

const {
  alerts
} = require('../util/')

const data = {
  name: 'join',
  desc: 'Join a room',
  options: {
    args: [{ name: 'room', mand: true, delim: '|' }, { name: 'password', mand: true }],
    guildOnly: true,
    authLevel: 1,
    guide: {
      color: 65280,
      fields: [{
        name: 'Join a room someone has created',
        value: 'If your friend has created a room and has given you its name and password, good news! You can join in\nSimply enter a room\'s name and password separated by a bar (`|`) to join a room\nNow you can send messages across a room to all the guilds in it'
      }]
    }
  },
  action: async ({ agent, msg, args: [name, pass] }) => {
    await msg.delete()

    const [roomData] = await agent.attachments.db('rooms')
      .select(['name', 'pass'])
      .where(agent.attachments.db.raw('LOWER(name) = ?', name.toLowerCase()))

    if (roomData) {
      if (pass === roomData.pass) {
        const guilds = await agent.attachments.db('guilds')
          .select(['id', 'channel', 'room'])
          .where('id', msg.channel.guild.id)
          .andWhere('room', roomData.name)

        const guildData = guilds.find((g) => g.id === msg.channel.guild.id)

        if (guildData) {
          if (guildData.room === roomData.name) return `\`You are already in ${roomData.name}\``
          else {
            const buttons = [
              new ReactCommand({
                emoji: '✅',
                action: () => {
                  return agent.attachments.transmit({ room: guildData.room, msg: alerts.leave({ guildName: msg.channel.guild.name }) })
                    .then(agent.attachments.db('guilds')
                      .update('room', roomData.name)
                      .where('id', msg.channel.guild.id))
                    .then(agent.attachments.transmit({ room: roomData.name, msg: alerts.join({ guildName: msg.channel.guild.name, guildsInRoom: guilds.length }) }))
                    .then(() => `Successfully joined **${roomData.name}**.`)
                }
              }),
              new ReactCommand({
                emoji: ':RedTick:457860110056947712',
                action: () => '`Switch canceled`'
              })
            ]

            return {
              content: `You are already in the room **${guildData.room}**. Would you like to switch to **${roomData.name}**?`,
              options: {
                reactInterface: new ReactInterface({
                  buttons,
                  options: {
                    deleteAfterUse: true,
                    removeReactions: true,
                    authLevel: 1
                  }
                })
              }
            }
          }
        } else {
          const channel = agent.attachments.getValidChannel(msg.channel.guild, msg.channel)

          if (channel) await agent.attachments.joinRoom(agent.client, agent.attachments.db, msg.channel.guild, channel, roomData.name, guilds.filter((g) => g.room === roomData.name).length)

          return `Successfully joined **${roomData.name}**`
        }
      } else return '`Incorrect password`'
    } else return `\`Could not find a room named "${name}"\``
  }
}

module.exports = new Command(data)

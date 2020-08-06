const {
  Command,
  ReactCommand,
  ReactInterface
} = require('cyclone-engine')

const {
  alerts,
  assets
} = require('../util/')

const data = {
  name: 'invite',
  desc: 'Invite a guild to your room',
  options: {
    args: [{ name: 'guild', mand: true }],
    guildOnly: true,
    authLevel: 1,
    guide: [{
      color: 2600252,
      fields: [{
        name: 'Joining a room without its password',
        value: 'If you are unable or unwilling to give a guild owner your room password but want them to join your room, you can use this command to send an invite to their guild (as long as the bot is in it) which the owner can accept to join the room without needing its password'
      }]
    }]
  },
  action: async ({ agent, msg, args: [guild] }) => {
    const target = agent.client.guilds.find((g) => g.name.toLowerCase() === guild.toLowerCase())

    if (target) {
      const currentGuildSubquery = agent.attachments.db('guilds')
        .select('room')
        .where('id', msg.channel.guild.id)

      const guilds = await agent.attachments.db('guilds')
        .select(['id', 'room'])
        .where('room', 'in', currentGuildSubquery)
        .orWhere('id', target.id)

      if (guilds.length) {
        const guildData = guilds.find((g) => g.id === msg.channel.guild.id)

        const [roomData] = agent.attachments.db('rooms')
          .select('owner')
          .where('name', guildData.room)

        if (msg.channel.guild.id === roomData.owner) {
          const targetData = guilds.find((g) => g.id === target.id)

          if (targetData) return `\`${target.name} is already in the room: ${targetData.room}\``

          const channel = agent.attachments.getValidChannel(target)

          if (channel) {
            const buttons = [
              new ReactCommand({
                emoji: ':RedTick:457860110056947712',
                action: () => {
                  agent.attachments.transmit({ room: guildData.room, msg: alerts.inviteDecline({ guildName: target.name }) })
                    .then(() => '`Invite Declined`')
                }
              }),
              new ReactCommand({
                emoji: '✅',
                action: () => {
                  agent.attachments.joinRoom(agent.client, agent.attachments.db, target, channel, guildData.room, guilds.length)
                    .then(() => `Successfully joined **${guildData.room}**`)
                    .catch(() => '`An error occurred. You might already be in a room`')
                }
              })
            ]

            await agent.attachments.transmit({ room: guildData.room, msg: alerts.invite({ guildName: target.name }) })

            return [
              {
                embed: {
                  author: {
                    name: 'Invite',
                    icon_url: msg.channel.guild.iconURL
                  },
                  title: `Invited by: __${msg.channel.guild.name}__`,
                  description: `Room name: **${guildData.room}**\nNumber of guilds in room: **${guilds.length}**`,
                  thumbnail: {
                    url: assets.invite
                  },
                  color: 2600252,
                  footer: {
                    text: 'To redirect invite recieving, remove the ability for the bot to talk in this channel.'
                  }
                },
                options: {
                  channels: channel.id,
                  reactInterface: new ReactInterface({
                    buttons,
                    options: {
                      deleteAfterUse: true,
                      removeReaction: true,
                      authLevel: 1
                    }
                  })
                }
              },
              `**${target.name}** invited`
            ]
          } else return `\`${target.name} does not have a channel the bot can talk in\``
        } else return `\`You do not own: ${guildData.room}\``
      } else return '`You are not currently in a room`'
    } else return `\`Could not find a guild named "${guild}"\``
  }
}

module.exports = new Command(data)

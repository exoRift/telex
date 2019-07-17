const { Await } = require('cyclone-engine')

const data = {
  name: 'Transmission Channel',
  value: ({ guildData }) => `<#${guildData.channel}>`,
  emoji: '📜',
  action: () => {
    return {
      content: 'Type the new transmission channel (Cancels after 10 seconds):',
      options: {
        wait: new Await({
          options: {
            timeout: 10000,
            args: [{ name: 'channel', mand: true }]
          },
          action: ({ client, msg, args: [channelName], knex }) => {
            const channel = msg.channel.guild.channels.find(msg.channelMentions.length
              ? (c) => c.id === msg.channelMentions[0]
              : (c) => c.name.toLowerCase() === channelName.toLowerCase())

            if (channel) {
              if (channel.permissionsOf(client.user.id).has('sendMessages')) {
                return knex.update({
                  table: 'guilds',
                  where: {
                    id: msg.channel.guild.id
                  },
                  data: {
                    channel: channel.id
                  }
                }).then(() => `Your transmission channel has been set to **${channel.name}**.`)
              } else return `\`The bot does not have permission to send messages in **${channel.name}**.\``
            }

            return `\`Could not find channel ${channelName}.\``
          }
        })
      }
    }
  }
}

module.exports = data

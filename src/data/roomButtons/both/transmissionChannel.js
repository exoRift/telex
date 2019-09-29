const {
  Await
} = require('cyclone-engine')

const data = {
  name: 'Transmission Channel',
  value: ({ guildData }) => `<#${guildData.channel}>`,
  emoji: '📜',
  action: ({ msg }) => {
    return {
      content: 'Type the new transmission channel (Cancels after 10 seconds):',
      options: {
        wait: new Await({
          options: {
            timeout: 10000,
            args: [{ name: 'channel', mand: true }]
          },
          action: async ({ agent, client, msg: response, args: [channelName], knex, triggerResponse }) => {
            triggerResponse.delete().catch((ignore) => ignore)

            const channel = response.channel.guild.channels.find(response.channelMentions.length
              ? (c) => c.id === response.channelMentions[0]
              : (c) => c.name.toLowerCase() === channelName.toLowerCase())

            if (channel) {
              if (channel.permissionsOf(client.user.id).has('sendMessages')) {
                const {
                  room
                } = await knex.get({
                  table: 'guilds',
                  columns: 'room',
                  where: {
                    id: response.channel.guild.id
                  }
                })

                return knex.update({
                  table: 'guilds',
                  where: {
                    id: response.channel.guild.id
                  },
                  data: {
                    channel: channel.id
                  }
                }).then(async () => {
                  msg.edit(await agent.buildPanel(room, response.channel.guild.id)).catch((ignore) => ignore)
                  response.delete().catch((ignore) => ignore)
                })
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

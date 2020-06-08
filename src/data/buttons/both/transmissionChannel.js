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
        awaits: new Await({
          options: {
            timeout: 10000,
            args: [{ name: 'channel', mand: true }]
          },
          action: ({ agent, msg: response, args: [name], triggerResponse }) => {
            triggerResponse.delete().catch((ignore) => ignore)

            const channel = msg.channel.guild.channels.find(response.channelMentions.length
              ? (c) => c.id === response.channelMentions[0]
              : (c) => c.name.toLowerCase() === name.toLowerCase())

            if (channel) {
              if (channel.permissionsOf(agent.client.user.id).has('readMessages') && channel.permissionsOf(agent.client.user.id).has('sendMessages')) {
                return agent.attachments.db('guilds')
                  .select('room')
                  .where('id', msg.channel.guild.id)
                  .then(([{ room }]) => agent.attachments.db('guilds')
                    .update('channel', channel.id)
                    .where('id', msg.channel.guild.id)
                    .then(async () => {
                      response.delete().catch((ignore) => ignore)

                      msg.edit(await agent.attachments.buildPanel(room, msg.channel.guild.id)).catch((ignore) => ignore)
                    }))
              } else return `\`The bot does not have permission to send/receive messages in ${channel.name}.\``
            } else return `\`Could not find channel ${name}.\``
          }
        })
      }
    }
  }
}

module.exports = data

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
            args: [{ name: 'channel', type: 'channel', mand: true }]
          },
          action: async ({ agent, msg: response, args: [channel], triggerResponse }) => {
            await triggerResponse.delete().catch((ignore) => ignore)

            if (agent.attachments.isValidChannel(agent.client, channel)) {
              await agent.attachments.db('guilds')
                .update('channel', channel.id)
                .where('id', msg.channel.guild.id)
                .then(() => agent.attachments.db('guilds')
                  .select('room')
                  .where('id', msg.channel.guild.id))
                .then(async ([guildData]) => {
                  await response.delete().catch((ignore) => ignore)

                  await msg.edit(await agent.attachments.buildPanel(agent.client, agent.attachments.db, guildData.room, msg.channel.guild.id)).catch((ignore) => ignore)
                })
            } else return `\`The bot does not have permission to send/receive messages in ${channel.name}\``
          }
        })
      }
    }
  }
}

module.exports = data

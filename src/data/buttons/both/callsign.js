const {
  Await
} = require('cyclone-engine')

const data = {
  name: 'Guild Callsign',
  value: ({ guildData }) => guildData.callsign || 'None',
  emoji: '🔰',
  action: ({ msg }) => {
    return {
      content: 'Type your new callsign for transmitted messages (Cancels after 10 seconds):',
      options: {
        awaits: new Await({
          options: {
            timeout: 10000,
            args: [{ name: 'callsign', mand: true }]
          },
          action: async ({ agent, msg: response, args: [callsign], triggerResponse }) => {
            await triggerResponse.delete().catch((ignore) => ignore)

            if (callsign.length > 5) return '`Callsign too long (Max 5 characters)`'

            for (const char of callsign) {
              if (char.charCodeAt() < 33 || char.charCodeAt() > 126) return '`Callsign contains an invalid character`'
            }

            await agent.attachments.db('guilds')
              .update('callsign', callsign)
              .where('id', msg.channel.guild.id)
              .then(() => agent.attachments.db('guilds')
                .select('room')
                .where('id', msg.channel.guild.id))
              .then(async ([guildData]) => {
                await response.delete().catch((ignore) => ignore)

                await msg.edit(await agent.attachments.buildPanel(agent.client, agent.attachments.db, guildData.room, msg.channel.guild.id)).catch((ignore) => ignore)
              })
          }
        })
      }
    }
  }
}

module.exports = data

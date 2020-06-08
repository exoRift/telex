const {
  Await
} = require('cyclone-engine')

const data = {
  name: 'Guild Abbreviation',
  value: ({ guildData }) => guildData.abbreviation || 'None',
  emoji: '🔰',
  action: ({ msg }) => {
    return {
      content: 'Type your new abbreviation for transmitted messages (Cancels after 10 seconds):',
      options: {
        awaits: new Await({
          options: {
            timeout: 10000,
            args: [{ name: 'abbreviation', mand: true }]
          },
          action: ({ agent, msg: response, args: [abbreviation], triggerResponse }) => {
            if (abbreviation.length > 5) return '`Abbreviation too long. (Max 5 characters)`'

            triggerResponse.delete().catch((ignore) => ignore)

            agent.attachments.db('guilds')
              .update('abbreviation', abbreviation)
              .where('id', msg.channel.guild.id)
              .then(() => agent.attachments.db('guilds')
                .select('room')
                .where('id', msg.channel.guild.id))
              .then(async ([{ room }]) => {
                response.delete().catch((ignore) => ignore)

                msg.edit(await agent.attachments.buildPanel(room, msg.channel.guild.id)).catch((ignore) => ignore)
              })
          }
        })
      }
    }
  }
}

module.exports = data

const {
  Await
} = require('cyclone-engine')

const {
  announce
} = require('../../utils/alerts/')

const data = {
  name: 'Announce',
  emoji: '📣',
  action: ({ msg }) => {
    return {
      content: 'Type your announcement (Cancels in 10 seconds):',
      options: {
        awaits: new Await({
          options: {
            timeout: 10000,
            args: [{ name: 'announcement' }]
          },
          action: ({ agent, msg: response, args: [announcement], triggerResponse }) => {
            triggerResponse.delete().catch((ignore) => ignore)

            return agent.attachments.db('guilds')
              .select('room')
              .where('id', msg.channel.guild.id)
              .then(async ([{ room }]) => {
                response.delete().catch((ignore) => ignore)

                agent.attachments.transmit({ room, msg: announce({ guildName: msg.channel.guild.name, content: announcement }) })
              })
          }
        })
      }
    }
  }
}

module.exports = data

const {
  Await
} = require('cyclone-engine')

const {
  announce
} = require('../../alerts/')

const data = {
  name: 'Announce',
  emoji: '📣',
  action: ({ agent, msg, knex }) => {
    return {
      content: 'Type your announcement (Cancels in 10 seconds):',
      options: {
        wait: new Await({
          options: {
            timeout: 10000,
            args: [{ name: 'announcement' }]
          },
          action: ({ msg: response, args: [announcement], triggerResponse }) => {
            triggerResponse.delete().catch((ignore) => ignore)

            return knex.get({
              table: 'guilds',
              columns: 'room',
              where: {
                id: msg.channel.guild.id
              }
            }).then(({ room }) => {
              agent.transmit({ room, msg: announce({ guildName: msg.channel.guild.name, content: announcement }) })

              response.delete().catch((ignore) => ignore)
            })
          }
        })
      }
    }
  }
}

module.exports = data

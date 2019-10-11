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
        wait: new Await({
          options: {
            timeout: 10000,
            args: [{ name: 'abbreviation', mand: true }]
          },
          action: ({ agent, msg: response, args: [abbreviation], knex, triggerResponse }) => {
            triggerResponse.delete().catch((ignore) => ignore)

            if (abbreviation.length > 5) return '`Abbreviation too long.`'

            knex.update({
              table: 'guilds',
              where: {
                id: msg.channel.guild.id
              },
              data: {
                abbreviation
              }
            }).then(async () => {
              const {
                room
              } = await knex.get({
                table: 'guilds',
                columns: 'room',
                where: {
                  id: msg.channel.guild.id
                }
              })

              msg.edit(await agent.buildPanel(room, msg.channel.guild.id)).catch((ignore) => ignore)
              response.delete().catch((ignore) => ignore)
            })
          }
        })
      }
    }
  }
}

module.exports = data

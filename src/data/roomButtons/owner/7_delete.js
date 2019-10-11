const {
  Await
} = require('cyclone-engine')

const {
  deleteRoom
} = require('../../alerts/')

const data = {
  name: 'Delete',
  emoji: '❌',
  action: async ({ msg, knex }) => {
    const {
      name,
      pass
    } = await knex.get({
      table: 'rooms',
      columns: ['name', 'pass'],
      where: {
        owner: msg.channel.guild.id
      }
    })

    return {
      content: `Are you sure you want to delete **${name}**? Please type your room password to confirm (Cancels in 10 seconds):`,
      options: {
        wait: new Await({
          options: {
            timeout: 10000,
            args: [{ name: 'password', mand: true }]
          },
          action: async ({ agent, msg: response, args: [password], triggerResponse }) => {
            if (password === pass) {
              triggerResponse.delete().catch((ignore) => ignore)

              await agent.transmit({ room: name, msg: deleteRoom({ roomName: name }) })

              await knex.delete({
                table: 'rooms',
                where: {
                  name
                }
              })
              await knex.delete({
                table: 'guilds',
                where: {
                  room: name
                }
              })

              response.delete().catch((ignore) => ignore)
              msg.delete().catch((ignore) => ignore)

              return `Room **${name}** deleted.`
            }

            return '`Password incorrect.`'
          }
        })
      }
    }
  }
}

module.exports = data

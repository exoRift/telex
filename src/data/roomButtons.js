const {
  Await
} = require('cyclone-engine')

const {
  transmit
} = require('../utils.js')

const {
  rename
} = require('./alerts.js')

const ownerButtons = [
  {
    name: 'Name',
    value: ({ roomData }) => roomData.name,
    emoji: '📝',
    action: ({ reactInterface }) => {
      return {
        content: 'Type a new name for your room (Cancels after 10 seconds): ',
        wait: new Await({
          options: {
            check: ({ msg }) => reactInterface.designatedUsers.includes(msg.author.id),
            timeout: 10000,
            args: [{ name: 'name' }]
          },
          action: async ({ client, msg, args: [name], knex }) => {
            const room = await knex.get({
              table: 'rooms',
              where: {
                owner: msg.channel.guild.id
              }
            })

            return knex.update({
              table: 'rooms',
              where: {
                owner: msg.channel.guild.id
              },
              data: {
                name
              }
            })
              .then(() => {
                return knex.update({
                  table: 'guilds',
                  where: {
                    room: room.name
                  },
                  data: {
                    room: name
                  }
                }).then(() => {
                  const transmissionMsg = {
                    embed: rename
                  }

                  transmit({ client, knex, room: name, msg: transmissionMsg })
                  return `Successfully changed room name from \`${room.name}\` to \`${name}\``
                })
              })
              .catch(() => '`Room name taken.`')
          }
        })
      }
    }
  }
]
const memberButtons = [

]

module.exports = {
  ownerButtons,
  memberButtons
}

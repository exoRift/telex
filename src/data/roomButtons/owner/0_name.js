const {
  Await
} = require('cyclone-engine')

const {
  transmit
} = require('../../utils.js')

const {
  rename
} = require('../../alerts')

const data = {
  name: 'Name',
  value: ({ roomData }) => roomData.name,
  emoji: '📝',
  action: ({ reactInterface }) => {
    return {
      content: 'Type a new name for your room (Cancels after 10 seconds): ',
      wait: new Await({
        options: {
          timeout: 10000,
          args: [{ name: 'name', mand: true }]
        },
        action: async ({ client, msg, args: [name], knex }) => {
          const room = await knex.get({
            table: 'rooms',
            columns: 'name',
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
                transmit({ client, knex, room: name, msg: { embed: rename({ oldName: room.name, newName: name }) } })

                return `Successfully changed room name from \`${room.name}\` to \`${name}\``
              })
            })
            .catch(() => '`Room name taken.`')
        }
      })
    }
  }
}

module.exports = data

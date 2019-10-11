const {
  Await
} = require('cyclone-engine')

const {
  rename
} = require('../../alerts/')

const data = {
  name: 'Name',
  value: ({ roomData }) => roomData.name,
  emoji: '📝',
  action: ({ msg, agent, reactInterface }) => {
    return {
      content: 'Type a new name for your room (Cancels after 10 seconds): ',
      options: {
        wait: new Await({
          options: {
            timeout: 10000,
            args: [{ name: 'name', mand: true }]
          },
          action: async ({ client, msg: response, args: [name], knex, triggerResponse }) => {
            triggerResponse.delete().catch((ignore) => ignore)

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
              .catch(() => '`Room name taken.`')
              .then(() => {
                return knex.update({
                  table: 'guilds',
                  where: {
                    room: room.name
                  },
                  data: {
                    room: name
                  }
                }).then(async () => {
                  agent.transmit({ room: name, msg: rename({ oldName: room.name, newName: name }) })

                  msg.edit(await agent.buildPanel(name, msg.channel.guild.id)).catch((ignore) => ignore)
                  response.delete().catch((ignore) => ignore)
                })
              })
          }
        })
      }
    }
  }
}

module.exports = data

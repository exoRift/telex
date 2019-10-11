const {
  Await
} = require('cyclone-engine')

const {
  kick
} = require('../../alerts/')

const data = {
  name: 'Kick',
  emoji: '👢',
  action: () => {
    return {
      content: 'Type the name of the guild you want to kick from your room (Cancels in 10 seconds):',
      options: {
        wait: new Await({
          options: {
            timeout: 10000,
            args: [{ name: 'guild', mand: true }]
          },
          action: async ({ agent, client, msg, args: [guildName], knex, triggerResponse }) => {
            triggerResponse.delete().catch((ignore) => ignore)

            const target = client.guilds.find((g) => g.name.toLowerCase() === guildName.toLowerCase())

            if (target) {
              const roomData = await knex.get({
                table: 'rooms',
                columns: 'name',
                where: {
                  owner: msg.channel.guild.id
                }
              })
              const guildData = await knex.get({
                table: 'guilds',
                columns: 'id',
                where: {
                  id: target.id,
                  room: roomData.name
                }
              })

              if (guildData) {
                return agent.transmit({ room: roomData.name, msg: kick({ guildName: target.name }) }).then(() => {
                  return knex.delete({
                    table: 'guilds',
                    where: {
                      id: target.id
                    }
                  }).then(() => msg.delete().catch((ignore) => ignore))
                })
              }

              return `\`${target.name} is not in your room.\``
            }

            return `\`Could not find a guild named ${guildName}.\``
          }
        })
      }
    }
  }
}

module.exports = data

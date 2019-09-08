const {
  ReactCommand,
  ReactInterface
} = require('cyclone-engine')

const {
  leave
} = require('../../alerts/')

const data = {
  name: 'Leave',
  emoji: '🚪',
  action: ({ msg, knex }) => {
    return knex.get({
      table: 'guilds',
      columns: ['room', 'adminrole'],
      where: {
        id: msg.channel.guild.id
      }
    }).then(({ room, adminrole }) => {
      const buttons = [
        new ReactCommand({
          emoji: '✅',
          action: async ({ agent }) => {
            await agent.transmit({ room, msg: leave({ guildName: msg.channel.guild.name }) })

            return knex.delete({
              table: 'guilds',
              where: {
                id: msg.channel.guild.id
              }
            }).then(() => `Successfully left **${room}**.`)
          }
        }),
        new ReactCommand({
          emoji: ':RedTick:457860110056947712',
          action: ({ msg }) => msg.delete().then(() => '`Leave canceled.`').catch((ignore) => ignore)
        })
      ]

      return {
        content: `Are you sure you want to leave **${room}**?`,
        options: {
          reactInterface: new ReactInterface({
            buttons,
            options: {
              deleteAfterUse: true,
              restricted: true,
              designatedUsers: adminrole ? msg.channel.guild.members.reduce((accum, { id, roles }) => {
                if (roles.find((r) => r === adminrole)) accum.push(id)
                return accum
              }, []).concat([msg.channel.guild.ownerID]) : msg.channel.guild.ownerID
            }
          })
        }
      }
    })
  }
}

module.exports = data

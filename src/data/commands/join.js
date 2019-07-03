const {
  Command,
  ReactCommand,
  ReactInterface
} = require('cyclone-engine')

const { abbreviate } = require('../utils.js')

const {
  leave,
  join
} = require('../alerts')

const data = {
  name: 'join',
  description: 'Join a room.',
  options: {
    args: [{ name: 'room', mand: true }, { name: 'password', mand: true }]
  },
  action: async ({ agent, client, msg, args: [roomName, password], knex }) => {
    const guilds = await knex.select({
      table: 'guilds',
      columns: ['id', 'channel', 'room', 'adminrole']
    })
    const guild = guilds.find((g) => g.id === msg.channel.guild.id)
    const room = await knex.get({
      table: 'rooms',
      columns: 'pass',
      where: {
        name: roomName
      }
    })

    if (!room) return '`Room does not exist.`'
    if (password !== room.pass) return '`Password incorrect.`'

    if (guild) {
      const { owner } = await knex.get({
        table: 'rooms',
        columns: 'owner',
        where: {
          name: guild.room
        }
      })

      if (msg.channel.guild.id === owner) return '`You can\'t join a room when you own one.`'
      if (guild.room === roomName) return `\`You are already in ${roomName}.\``

      const buttons = [
        new ReactCommand({
          emoji: '✅',
          action: async () => {
            await agent.transmit({ room: guild.room, msg: leave({ guildName: msg.channel.guild.name }) })

            await knex.update({
              table: 'guilds',
              where: {
                id: msg.channel.guild.id
              },
              data: {
                room: roomName
              }
            })

            return agent.transmit({ room: roomName, msg: join({ guildName: msg.channel.guild.name, guildsInRoom: guilds.length }) }).then(() => `Successfully joined **${roomName}**.`)
          }
        }),
        new ReactCommand({
          emoji: ':RedTick:457860110056947712',
          action: () => '`Switch canceled.`'
        })
      ]

      return {
        content: `You are already in the room **${guild.room}**. Would you like to switch?`,
        reactInterface: new ReactInterface({
          buttons,
          options: {
            deleteAfterUse: true,
            restricted: true,
            designatedUsers: guild.adminrole ? msg.channel.guild.members.reduce((accum, { id, roles }) => {
              if (roles.find((r) => r === guild.adminrole)) accum.push(id)
              return accum
            }, []).concat([msg.channel.guild.ownerID]) : msg.channel.guild.ownerID
          }
        })
      }
    }

    return knex.insert({
      table: 'guilds',
      data: {
        id: msg.channel.guild.id,
        channel: !msg.channel.permissionsOf(client.user.id).has('sendMessages') ? msg.channel.guild.channels.find((c) => c.permissionsOf(client.user.id).has('sendMessages') && !c.type) : msg.channel.id,
        room: roomName,
        abbreviation: abbreviate(msg.channel.guild.name)
      }
    }).then(async () => {
      const guildsInRoom = await knex.select({
        table: 'guilds',
        columns: 'id',
        where: {
          room: roomName
        }
      })

      agent.transmit({ room: roomName, msg: join(msg.channel.guild.name, guildsInRoom.length) })

      return `Successfully joined **${roomName}**.`
    })
  }
}

module.exports = new Command(data)

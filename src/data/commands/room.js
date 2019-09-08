const {
  Command
} = require('cyclone-engine')

const {
  abbreviate
} = require('../utils.js')

const join = require('./join.js')

const data = {
  name: 'room',
  desc: 'Open the room management panel',
  action: async ({ agent, client, msg, knex }) => {
    let guildData = await knex.get({
      table: 'guilds',
      where: {
        id: msg.channel.guild.id
      }
    })

    if (!guildData) {
      if (msg.author.id === msg.channel.guild.ownerID) {
        const room = `${msg.author.username}#${msg.author.discriminator}'s room`

        const existing = await knex.get({
          table: 'rooms',
          columns: 'pass',
          where: {
            name: room
          }
        })

        if (existing) await join.action({ agent, client, msg, args: [room, existing.pass], knex })
        else {
          guildData = {
            id: msg.channel.guild.id,
            channel: msg.channel.id,
            room,
            abbreviation: abbreviate(msg.channel.guild.name)
          }

          await knex.insert({
            table: 'guilds',
            data: guildData
          })

          await knex.insert({
            table: 'rooms',
            data: {
              name: room,
              pass: '1234',
              owner: msg.channel.guild.id
            }
          })
          msg.channel.createMessage('Room created! By default, your password is `1234`.')
        }
      } else return '`You are unauthorized to do that`'
    }

    if (!msg.member.roles.includes(guildData.adminrole) && msg.author.id !== msg.channel.guild.ownerID) return '`You are unauthorized to do that`'

    return agent.buildPanel(guildData.room, msg.channel.guild.id)
  }
}

module.exports = new Command(data)

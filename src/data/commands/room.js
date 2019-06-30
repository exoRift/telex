const {
  Command,
  ReactCommand,
  ReactInterface
} = require('cyclone-engine')

const {
  ownerButtons,
  memberButtons
} = require('../roomButtons.js')

const data = {
  name: 'room',
  desc: 'Open the room management panel',
  action: async ({ client, msg, knex }) => {
    let guildData = await knex.get({
      table: 'guilds',
      where: {
        guild: msg.channel.guild.id
      }
    })

    if (!guildData) {
      const room = `${msg.author.username}#${msg.author.discriminator}'s room`

      await knex.insert({
        table: 'guilds',
        data: {
          guild: msg.channel.guild.id,
          channel: msg.channel.id,
          room
        }
      })
      guildData = await knex.get({
        table: 'guilds',
        where: {
          guild: msg.channel.guild.id
        }
      })

      await knex.insert({
        table: 'rooms',
        data: {
          name: room,
          pass: '1234',
          owner: msg.channel.guild.id
        }
      })
    }

    const roomData = await knex.get({
      table: 'rooms',
      where: {
        name: guildData.room
      }
    })

    if (guildData.adminrole ? !msg.member.roles.map((r) => r.id).includes(guildData.adminrole) : msg.author.id !== msg.channel.guild.ownerID) return '`You are unauthorized to do that`'

    const isOwner = msg.channel.guild.id === roomData.owner
    const buttons = isOwner ? ownerButtons : memberButtons

    return {
      embed: {
        title: `**${roomData.name}**`,
        author: {
          name: 'Room Control Panel',
          icon_url: msg.channel.guild.iconURL
        },
        footer: {
          text: 'You are ' + (isOwner ? 'the owner' : 'a member')
        },
        thumbnail: {
          url: client.guilds.find((g) => g.id === roomData.owner).iconURL
        },
        fields: buttons.map((b) => {
          return {
            name: `${b.emoji} **${b.name}**`,
            value: b.value ? b.value({ guildData, roomData }) : '​'
          }
        })
      },
      reactInterface: new ReactInterface({
        buttons: buttons.map((b) => new ReactCommand(b)),
        options: {
          restricted: true,
          designatedUsers: guildData.adminrole ? msg.channel.guild.members.reduce((accum, { id, roles }) => {
            if (roles.find((r) => r.id === guildData.adminrole)) accum.push(id)
            return accum
          }, []) : msg.channel.guild.ownerID
        }
      })
    }
  }
}

module.exports = new Command(data)

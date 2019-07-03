const {
  Command,
  ReactCommand,
  ReactInterface
} = require('cyclone-engine')

const {
  ownerButtons,
  memberButtons
} = require('../roomButtons')

const { abbreviate } = require('../utils.js')

const data = {
  name: 'room',
  desc: 'Open the room management panel',
  action: async ({ client, msg, knex }) => {
    let guildData = await knex.get({
      table: 'guilds',
      where: {
        id: msg.channel.guild.id
      }
    })

    if (!guildData) {
      const room = `${msg.author.username}#${msg.author.discriminator}'s room`
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
    }

    const roomData = await knex.get({
      table: 'rooms',
      where: {
        name: guildData.room
      }
    })

    if (!msg.member.roles.includes(guildData.adminrole) && msg.author.id !== msg.channel.guild.ownerID) return '`You are unauthorized to do that`'

    const isOwner = msg.channel.guild.id === roomData.owner
    const buttons = isOwner ? ownerButtons : memberButtons

    return {
      embed: {
        title: `**${roomData.name}**`,
        color: isOwner ? 4980889 : undefined,
        author: {
          name: 'Room Control Panel',
          icon_url: msg.channel.guild.iconURL
        },
        footer: {
          text: `${isOwner ? '👑 ' : ''}You are ${isOwner ? 'the owner' : 'a member'} of the room`
        },
        thumbnail: {
          url: client.guilds.find((g) => g.id === roomData.owner).iconURL
        },
        fields: buttons.map((b) => {
          return {
            name: `${b.emoji} **${b.name}**`,
            value: b.value ? b.value({ client, msg, guildData, roomData }) : '​',
            inline: true
          }
        })
      },
      reactInterface: new ReactInterface({
        buttons: buttons.map((b) => new ReactCommand(b)),
        options: {
          restricted: true,
          designatedUsers: guildData.adminrole ? msg.channel.guild.members.reduce((accum, { id, roles }) => {
            if (roles.find((r) => r === guildData.adminrole)) accum.push(id)
            return accum
          }, []).concat([msg.channel.guild.ownerID]) : msg.channel.guild.ownerID,
          removeReaction: true
        }
      })
    }
  }
}

module.exports = new Command(data)

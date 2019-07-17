const {
  Command,
  ReactCommand,
  ReactInterface
} = require('cyclone-engine')

const {
  links: { inviteIcon },
  abbreviate
} = require('../utils.js')

const {
  invite,
  inviteDecline,
  join
} = require('../alerts')

const data = {
  name: 'invite',
  desc: 'Invite a guild to your room',
  options: {
    args: [{ name: 'guild', mand: true }]
  },
  action: async ({ agent, client, msg, args: [guild], knex }) => {
    const guilds = await knex.select({
      table: 'guilds',
      columns: ['id', 'room', 'adminrole']
    })

    if (!msg.member.roles.includes(guilds.find((g) => g.id === msg.channel.guild.id).adminrole) && msg.author.id !== msg.channel.guild.ownerID) return '`You are unauthorized to do that`'

    const guildData = guilds.find((g) => g.id === msg.channel.guild.id)

    if (guildData) {
      const roomData = await knex.get({
        table: 'rooms',
        columns: 'name',
        where: {
          owner: msg.channel.guild.id
        }
      })

      if (roomData) {
        const target = client.guilds.find((g) => g.name.toLowerCase() === guild.toLowerCase())

        if (target) {
          const targetData = await knex.get({
            table: 'guilds',
            columns: 'room',
            where: {
              id: target.id
            }
          })

          if (targetData) return `\`${target.name} is already in the room ${targetData.room}.\``

          const channel = target.channels.find((c) => c.permissionsOf(client.user.id).has('sendMessages') && !c.type)
          if (channel) {
            return channel.createMessage({
              embed: {
                author: {
                  name: 'Invite',
                  icon_url: msg.channel.guild.iconURL
                },
                title: `Invited by: __${msg.channel.guild.name}__`,
                description: `Room name: **${roomData.name}**\nNumber of guilds in room: **${guilds.filter((g) => g.room === roomData.name).length}**`,
                thumbnail: {
                  url: inviteIcon
                },
                color: 2600252,
                footer: {
                  text: 'To redirect invite recieving, remove the ability for the bot to talk in this channel.'
                }
              }
            }).then((rsp) => {
              const buttons = [
                new ReactCommand({
                  emoji: ':RedTick:457860110056947712',
                  action: () => {
                    agent.transmit({ room: roomData.name, msg: inviteDecline({ guildName: target.name }) })
                    return '`Invite Declined.`'
                  }
                }),
                new ReactCommand({
                  emoji: '✅',
                  action: () => {
                    return knex.insert({
                      table: 'guilds',
                      data: {
                        id: target.id,
                        channel: channel.id,
                        room: roomData.name,
                        abbreviation: abbreviate(target.name)
                      }
                    }).then(() =>
                      agent.transmit({ room: roomData.name, msg: join({ guildName: target.name, guildsInRoom: guilds.filter((g) => g.room === roomData.name).length }) })
                        .then(() => `Successfully joined **${roomData.name}**.`)
                    )
                  }
                })
              ]

              agent._reactionHandler.bindInterface(rsp, new ReactInterface({
                buttons,
                options: {
                  deleteAfterUse: true,
                  restricted: true,
                  designatedUsers: target.ownerID
                }
              }))
              agent.transmit({ room: roomData.name, msg: invite({ guildName: target.name }) })

              return `**${target.name}** invited.`
            })
          }

          return `\`${target.name} does not have a channel the bot can talk in.\``
        }

        return `\`Could not find a guild named ${guild}\``
      }

      return `\`You do not own ${guilds.find((g) => g.id === msg.channel.guild.id).room}.\``
    }

    return '`You are not in a room.`'
  }
}

module.exports = new Command(data)

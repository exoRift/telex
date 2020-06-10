const {
  Command,
  ReactCommand,
  ReactInterface
} = require('cyclone-engine')

const {
  abbreviate
} = require('../utils/')

const {
  invite,
  inviteDecline,
  join
} = require('../utils/alerts/')

const data = {
  name: 'invite',
  desc: 'Invite a guild to your room',
  options: {
    args: [{ name: 'guild', mand: true }],
    guildOnly: true
  },
  action: ({ agent, msg, args: [guild] }) => {
    const target = agent.client.guilds.find((g) => g.name.toLowerCase() === guild.toLowerCase())

    if (target) {
      const currentGuildSubquery = agent.attachments.db('guilds')
        .select('room')
        .where('id', msg.channel.guild.id)

      return agent.attachments.db('guilds')
        .select(['id', 'room', 'adminrole'])
        .where('room', 'in', currentGuildSubquery)
        .orWhere('id', target.id)
        .then((guilds) => {
          if (guilds.length) {
            if (msg.member.roles.includes(guilds.find((g) => g.id === msg.channel.guild.id).adminrole) || msg.author.id === msg.channel.guild.ownerID) {
              const guildData = guilds.find((g) => g.id === msg.channel.guild.id)

              return agent.attachments.db('rooms')
                .select('owner')
                .where('name', guildData.room)
                .then(([room]) => {
                  if (room.owner === msg.channel.guild.id) {
                    const targetData = guilds.find((g) => g.id === target.id)

                    if (targetData) return `\`${target.name} is already in the room: ${targetData.room}.\``

                    const channel = agent.attachments.getValidChannel(target)

                    if (channel) {
                      const buttons = [
                        new ReactCommand({
                          emoji: ':RedTick:457860110056947712',
                          action: () => {
                            agent.attachments.transmit({ room: guildData.room, msg: inviteDecline({ guildName: target.name }) })
                            return '`Invite Declined.`'
                          }
                        }),
                        new ReactCommand({
                          emoji: '✅',
                          action: () => {
                            return agent.attachments.db('guilds')
                              .insert({
                                id: target.id,
                                channel: channel.id,
                                room: guildData.room,
                                abbreviation: abbreviate(target.name)
                              })
                              .then(() =>
                                agent.attachments.transmit({ room: guildData.room, msg: join({ guildName: target.name, guildsInRoom: guilds.filter((g) => g.room === guildData.room).length }) })
                                  .then(() => `Successfully joined **${guildData.room}**.`)
                              )
                              .catch(() => '`An error occurred. You might already be in a room.`')
                          }
                        })
                      ]

                      return agent.attachments.transmit({ room: guildData.room, msg: invite({ guildName: target.name }) }).then(() => [
                        {
                          embed: {
                            author: {
                              name: 'Invite',
                              icon_url: msg.channel.guild.iconURL
                            },
                            title: `Invited by: __${msg.channel.guild.name}__`,
                            description: `Room name: **${guildData.room}**\nNumber of guilds in room: **${guilds.filter((g) => g.room === guildData.room).length}**`,
                            thumbnail: {
                              url: 'https://raw.githubusercontent.com/exoRift/telex/master/assets/Invite.png'
                            },
                            color: 2600252,
                            footer: {
                              text: 'To redirect invite recieving, remove the ability for the bot to talk in this channel.'
                            }
                          },
                          options: {
                            channels: channel.id,
                            reactInterface: new ReactInterface({
                              buttons,
                              options: {
                                deleteAfterUse: true,
                                removeReaction: true,
                                designatedUsers: target.ownerID
                              }
                            })
                          }
                        },
                        `**${target.name}** invited.`
                      ])
                    } else return `\`${target.name} does not have a channel the bot can talk in.\``
                  } else return `\`You do not own ${guildData.room}.\``
                })
            } else return '`You are unauthorized to do that`'
          } else return '`You are not in a room.`'
        })
    } else return `\`Could not find a guild named ${guild}\``
  }
}

module.exports = new Command(data)

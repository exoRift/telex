const {
  Command,
  ReactCommand,
  ReactInterface
} = require('cyclone-engine')

const {
  abbreviate
} = require('../utils/')

const {
  leave,
  join
} = require('../utils/alerts/')

const data = {
  name: 'join',
  desc: 'Join a room',
  options: {
    args: [{ name: 'room', mand: true, delim: '|' }, { name: 'password', mand: true }],
    guildOnly: true
  },
  action: ({ agent, msg, args: [name, pass] }) => {
    if (msg.author.id === msg.channel.guild.ownerID) {
      return agent.attachments.db('rooms')
        .select(['name', 'pass'])
        .where(agent.attachments.db.raw('LOWER(name) = ?', name.toLowerCase()))
        .then(([room]) => {
          if (room) {
            if (pass === room.pass) {
              return agent.attachments.db('guilds')
                .select(['id', 'channel', 'adminrole'])
                .where('room', room.name)
                .andWhere('id', msg.channel.guild.id)
                .then((guilds) => {
                  const guildData = guilds.find((g) => g.id === msg.channel.guild.id)

                  if (guildData) {
                    if (guildData.room === room.name) return `\`You are already in ${room.name}.\``
                    else {
                      const buttons = [
                        new ReactCommand({
                          emoji: '✅',
                          action: () => {
                            return agent.attachments.transmit({ room: room.name, msg: leave({ guildName: msg.channel.guild.name }) })
                              .then(agent.attachments.db('guilds')
                                .update('room', name)
                                .where('id', msg.channel.guild.id))
                              .then(agent.attachments.transmit({ room: room.name, msg: join({ guildName: msg.channel.guild.name, guildsInRoom: guilds.length }) }))
                              .then(() => `Successfully joined **${room.name}**.`)
                          }
                        }),
                        new ReactCommand({
                          emoji: ':RedTick:457860110056947712',
                          action: () => '`Switch canceled.`'
                        })
                      ]

                      return {
                        content: `You are already in the room **${guildData.room}**. Would you like to switch?`,
                        options: {
                          reactInterface: new ReactInterface({
                            buttons,
                            options: {
                              deleteAfterUse: true,
                              removeReactions: true,
                              designatedUsers: guildData.adminrole
                                ? msg.channel.guild.members.reduce((accum, { id, roles }) => {
                                  if (roles.find((r) => r === guildData.adminrole)) accum.push(id)

                                  return accum
                                }, [msg.channel.guild.ownerID])
                                : msg.channel.guild.ownerID
                            }
                          })
                        }
                      }
                    }
                  } else {
                    const channel = agent.attachments.getValidChannel(msg.channel.guild, msg.channel)

                    if (channel) {
                      return agent.attachments.db('guilds')
                        .insert({
                          id: msg.channel.guild.id,
                          channel: channel.id,
                          room: room.name,
                          abbreviation: abbreviate(msg.channel.guild.name)
                        })
                        .then(agent.attachments.transmit({ room: room.name, msg: join({ guildName: msg.channel.guild.name, guildsInRoom: guilds.filter((g) => g.room === room.name).length }) }))
                        .then(() => `Successfully joined **${room.name}**.`)
                    }
                  }
                })
            } else return '`Password incorrect.`'
          } else return '`Room does not exist.`'
        })
    } else return '`You are unauthorized to do that.`'
  }
}

module.exports = new Command(data)

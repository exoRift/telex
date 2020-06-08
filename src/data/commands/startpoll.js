const {
  Command,
  ReactCommand,
  ReactInterface
} = require('cyclone-engine')

function buildField (choiceCounts, choiceName, index) {
  return {
    name: `${String(index + 1)}⃣  ${choiceName}`,
    value: `*${choiceCounts[index]}*`,
    inline: true
  }
}

const data = {
  name: 'startpoll',
  desc: 'Initiate a room-wide poll that lasts 10 minutes (Choices separated by spaces)',
  options: {
    args: [{ name: 'name', mand: true, delim: '|' }, { name: 'choices', mand: true }],
    guildOnly: true
  },
  action: ({ agent, msg, args: [name, choices] }) => {
    const currentGuildSubquery = agent.attachments.db('guilds')
      .select('room')
      .where('id', msg.channel.guild.id)

    return agent.attachments.db('guilds')
      .select(['id', 'channel', 'room', 'adminrole'])
      .where('room', 'in', currentGuildSubquery)
      .then(async (guilds) => {
        if (guilds.length) {
          const guildData = guilds.find((g) => g.id === msg.channel.guild.id)

          if (!msg.member.roles.includes(guildData.adminrole) && msg.author.id !== msg.channel.guild.ownerID) return '`You are unauthorized to do that`'

          choices = choices.split(' ').slice(0, 9)

          const poll = {
            votes: [],
            choices: new Array(choices.length).fill(0)
          }

          const response = {
            embed: {
              author: {
                name: 'Vote',
                icon_url: msg.channel.guild.iconURL
              },
              title: `**${name}**`,
              description: `Poll from: __${msg.channel.guild.name}__`,
              color: 16776960,
              fields: choices.map(buildField.bind(this, poll.choices)),
              footer: {
                text: `Initiated by: ${msg.author.username}`
              }
            }
          }

          return agent.attachments.transmit({ room: guildData.room, msg: response }).then((responses) => {
            const refresh = setInterval(() => {
              for (const response of responses) {
                response.embeds[0].fields = choices.map(buildField.bind(this, poll.choices))

                response.edit({
                  embed: response.embeds[0]
                })
              }
            }, 8000)

            const autoClose = setTimeout(() => closePoll(), 600000)

            const closePoll = () => {
              clearInterval(refresh)
              clearTimeout(autoClose)

              for (const response of responses) {
                response.embeds[0].color = 16711680

                response.edit({
                  embed: response.embeds[0]
                })

                agent.reactionHandler.detachInterface(response, false)
              }

              agent.attachments.transmit({
                room: guildData.room,
                msg: {
                  embed: {
                    author: {
                      name: 'Poll',
                      icon_url: msg.channel.guild.iconURL
                    },
                    title: '**The results are in!**',
                    description: `**${name}**`,
                    color: 65535,
                    fields: choices.map(buildField.bind(this, poll.choices)),
                    footer: {
                      text: `Initiated by: ${msg.author.username}`
                    }
                  }
                }
              })
            }

            for (const response of responses) {
              const buttons = choices.map((c, i) => new ReactCommand({
                emoji: String(i + 1) + '⃣',
                action: ({ emoji, user }) => {
                  if (!poll.votes.includes(user.id)) {
                    poll.choices[parseInt(emoji.name.slice(0, 1)) - 1]++

                    poll.votes.push(user.id)
                  }
                }
              }))

              if (response.channel.guild.id === msg.channel.guild.id) {
                buttons.push(new ReactCommand({
                  emoji: '❌',
                  action: closePoll
                }))
              }

              agent.reactionHandler.bindInterface(response, new ReactInterface({
                buttons
              }))
            }

            return 'Poll created!'
          })
        } else return '`You are not in a room.`'
      })
  }
}

module.exports = new Command(data)

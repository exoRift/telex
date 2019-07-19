const {
  Command,
  ReactCommand,
  ReactInterface
} = require('cyclone-engine')

const data = {
  name: 'startpoll',
  desc: 'Initiate a room-wide poll that lasts 10 minutes (Choices separated by parenthesis)',
  options: {
    args: [{ name: 'name', mand: true, delim: '|' }, { name: 'choices', mand: true }]
  },
  action: async ({ agent, msg, args: [name, choices], knex }) => {
    const guilds = await knex.select({
      table: 'guilds',
      columns: ['id', 'room', 'channel']
    })
    const guildData = guilds.find((g) => g.id === msg.channel.guild.id)

    if (guildData) {
      if (!msg.member.roles.includes(guilds.find((g) => g.id === msg.channel.guild.id).adminrole) && msg.author.id !== msg.channel.guild.ownerID) return '`You are unauthorized to do that`'

      const roomData = await knex.get({
        table: 'rooms',
        columns: 'owner',
        where: {
          name: guildData.room
        }
      })

      if (roomData.owner === msg.channel.guild.id) {
        choices = choices.split(' ').slice(0, 9)

        const id = String(Date.now())

        agent.polls[id] = {
          voted: [],
          choices: []
        }
        for (let i = 0; i < choices.length; i++) agent.polls[id].choices.push(0)

        const buildField = (c, i) => {
          return {
            name: `${String(i + 1)}⃣  ${choices[i]}`,
            value: `*${c}*`,
            inline: true
          }
        }

        const response = {
          embed: {
            author: {
              name: 'Vote',
              icon_url: msg.channel.guild.iconURL
            },
            title: `**${name}**`,
            description: `Poll from: __${msg.channel.guild.name}__\nInitiated by: **${msg.author.username}**`,
            color: 16776960,
            fields: agent.polls[id].choices.map(buildField),
            footer: {
              text: 'ID: ' + id
            }
          }
        }

        return agent.transmit({ room: guildData.room, msg: response }).then((responses) => {
          for (const response of responses) {
            agent._reactionHandler.bindInterface(response, new ReactInterface({
              buttons: choices.map((c, i) => new ReactCommand({
                emoji: String(i + 1) + '⃣',
                action: ({ emoji, user }) => {
                  if (agent.polls[id] && !agent.polls[id].voted.includes(user.id)) {
                    agent.polls[id].choices[parseInt(emoji.name.slice(0, 1)) - 1]++
                    agent.polls[id].voted.push(user.id)
                  }
                }
              }))
            }))
          }

          const interval = setInterval(() => {
            for (const response of responses) {
              response.embeds[0].fields = agent.polls[id].choices.map(buildField)

              response.edit({
                embed: response.embeds[0]
              })
            }
          }, 5000)

          setTimeout(() => {
            clearInterval(interval)

            for (const response of responses) {
              response.embeds[0].color = 16711680

              response.edit({
                embed: response.embeds[0]
              })
            }

            agent.transmit({
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
                  fields: agent.polls[id].choices.map(buildField),
                  footer: {
                    text: 'ID: ' + id
                  }
                }
              }
            })

            delete agent.polls[id]
          }, 600000)

          return 'Poll created!'
        })
      } else return `\`You do not own ${guildData.room}.\``
    } else return '`You are not in a room.`'
  }
}

module.exports = new Command(data)

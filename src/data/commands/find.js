const {
  Command
} = require('cyclone-engine')

const statuses = require('../utils/emojis.json')

const data = {
  name: 'find',
  desc: 'Return a user\'s ID (useful for mentioning across guilds)',
  options: {
    args: [{ name: 'username', mand: true, delim: '#' }, { name: 'discriminator', mand: true }]
  },
  action: ({ agent, args: [username, discrim] }) => {
    const guilds = agent.client.guilds.map((g) => g.members)

    for (const members of guilds) {
      const user = members.find((m) => m.username === username && m.discriminator === discrim)

      if (user) {
        return {
          embed: {
            author: {
              name: user.id,
              icon_url: user.avatarURL
            },
            title: `Status: ${statuses[user.game && user.game.type === 1 ? 'streaming' : user.status]}`,
            description: '<@ID> to mention the user',
            color: 6422766
          }
        }
      }
    }

    return {
      embed: {
        title: 'Could not find user.'
      }
    }
  }
}

module.exports = new Command(data)

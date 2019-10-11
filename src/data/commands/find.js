const {
  Command
} = require('cyclone-engine')

const {
  statusEmojis
} = require('../utils.js')

const data = {
  name: 'find',
  desc: 'Return a user\'s ID (useful for mentioning across guilds)',
  options: {
    args: [{ name: 'username', mand: true, delim: '|' }, { name: 'discriminator', mand: true }]
  },
  action: ({ client, args: [username, discriminator] }) => {
    const guildMembers = client.guilds.map((g) => g.members)
    for (const members of guildMembers) {
      const user = members.find((m) => m.username === username && m.discriminator === discriminator)
      if (user) {
        return {
          embed: {
            author: {
              name: user.id,
              icon_url: user.avatarURL
            },
            title: `Status: ${statusEmojis[user.game && user.game.type === 1 ? 'streaming' : user.status]}`,
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

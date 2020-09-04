const {
  Command
} = require('cyclone-engine')

const statuses = require('../util/emojis.json')

const data = {
  name: 'find',
  desc: 'Return a user\'s ID (useful for mentioning across guilds)',
  options: {
    args: [{ name: 'username', mand: true, delim: '#' }, { name: 'discriminator', mand: true }],
    guide: {
      color: 0x6200EE,
      fields: [{
        name: 'Cross-guild mentioning',
        value: 'When someone is in a guild you\'re not in, it can be hard to get their attention in a big room\nWhen attempting to mention the person, their name won\'t pop up\nIf you enter a user\'s name and discriminator, you\'re given a token you can insert in your message to mention them even if they\'re not in your guild'
      }]
    }
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
            description: `\\<@${user.id}> to mention the user`,
            color: 0x6200EE
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

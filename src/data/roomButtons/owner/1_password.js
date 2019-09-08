const {
  Await
} = require('cyclone-engine')

const data = {
  name: 'Password',
  value: ({ roomData }) => '•'.repeat(roomData.pass.length),
  emoji: '🔐',
  action: async ({ msg, user, knex }) => {
    const channel = await user.getDMChannel()
    const {
      name, pass
    } = await knex.get({
      table: 'rooms',
      columns: ['name', 'pass'],
      where: {
        owner: msg.channel.guild.id
      }
    })

    return channel.createMessage(`The current password to **${name}** is \`${pass}\`. Type a new password for your room (Cancels after 10 seconds):`)
      .then(() => {
        return {
          content: `**${user.username}** has been DM'd details to change the password.`,
          options: {
            wait: new Await({
              options: {
                timeout: 10000,
                channel: channel.id,
                args: [{ name: 'pass', mand: true }]
              },
              action: ({ args: [pass] }) => {
                return knex.update({
                  table: 'rooms',
                  where: {
                    name
                  },
                  data: {
                    pass
                  }
                }).then(() => 'Successfully changed password.')
              }
            })
          }
        }
      })
      .catch(() => `\`${user.username} has DMs turned off and cannot be messaged password details.\``)
  }
}

module.exports = data

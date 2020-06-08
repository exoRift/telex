const {
  Await
} = require('cyclone-engine')

const data = {
  name: 'Password',
  value: ({ roomData }) => '•'.repeat(roomData.pass.length),
  emoji: '🔐',
  action: ({ agent, msg, user }) => {
    return user.user.getDMChannel() // Fix this after next Cyclone patch
      .then((channel) => agent.attachments.db('rooms')
        .select(['name', 'pass'])
        .where('owner', msg.channel.guild.id))
      .then(([{ name, pass }]) => channel.createMessage(`The current password to **${name}** is \`${pass}\`. Type a new password for your room (Cancels after 10 seconds):`)
        .then(() => {
          return {
            content: `**${user.username}** has been DM'd details to change the password.`,
            options: {
              awaits: new Await({
                options: {
                  timeout: 10000,
                  channel: channel.id,
                  args: [{ name: 'pass', mand: true }]
                },
                action: ({ args: [pass] }) => {
                  // return agent.attachments.db('rooms')
                  //   .update('pass', pass)
                  //   .where('owner', msg.channel.guild.id)
                  //   .then(() => 'Successfully changed password.')

                  agent.attachments.db('rooms') // Fix this next Cyclone update
                    .update('pass', pass)
                    .where('owner', msg.channel.guild.id)
                    .then(() => channel.createMessage('Successfully changed password.'))
                }
              })
            }
          }
        })
        .catch(() => `\`${user.username} has DMs turned off and cannot be messaged password details.\``))
  }
}

module.exports = data

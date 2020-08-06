const {
  Await
} = require('cyclone-engine')

const data = {
  name: 'Password',
  value: ({ roomData }) => '•'.repeat(roomData.pass.length),
  emoji: '🔐',
  action: async ({ agent, msg, user }) => {
    const channel = await user.user.getDMChannel()

    const [roomData] = await agent.attachments.db('rooms')
      .select(['name', 'pass'])
      .where('owner', msg.channel.guild.id)

    return channel.createMessage(`The current password to **${roomData.name}** is \`${roomData.pass}\`. Type a new password for your room (Cancels after 10 seconds):`)
      .catch(() => `\`${user.username} has DMs turned off and cannot be messaged password details\``)
      .then(() => {
        return {
          content: `**${user.username}** has been DM'd details to change the password`,
          options: {
            awaits: new Await({
              options: {
                timeout: 10000,
                channel: channel.id,
                args: [{ name: 'pass', mand: true }]
              },
              action: ({ args: [pass] }) => agent.attachments.db('rooms')
                .update('pass', pass)
                .where('owner', msg.channel.guild.id)
                .then(async () => {
                  await msg.edit(await agent.attachments.buildPanel(agent.client, agent.attachments.db, roomData.name, msg.channel.guild.id)).catch((ignore) => ignore)

                  return 'Successfully changed password'
                })
            })
          }
        }
      })
  }
}

module.exports = data

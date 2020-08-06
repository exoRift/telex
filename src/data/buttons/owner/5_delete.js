const {
  Await
} = require('cyclone-engine')

const data = {
  name: 'Delete',
  emoji: '❌',
  action: async ({ agent, msg }) => {
    const [roomData] = await agent.attachments.db('rooms')
      .select(['name', 'pass'])
      .where('owner', msg.channel.guild.id)

    return {
      content: `Are you sure you want to delete **${roomData.name}**? Please type your room password to confirm (Cancels in 10 seconds):`,
      options: {
        awaits: new Await({
          options: {
            timeout: 10000,
            args: [{ name: 'password', mand: true }]
          },
          action: async ({ msg: response, args: [pass], triggerResponse }) => {
            if (pass === roomData.pass) {
              await triggerResponse.delete().catch((ignore) => ignore)

              await response.delete().catch((ignore) => ignore)
              await msg.delete().catch((ignore) => ignore)

              return agent.attachments.deleteRoom(agent.client, agent.attachments.db, roomData.name).then(() => `Room **${roomData.name}** deleted`)
            } else return '`Incorrect password`'
          }
        })
      }
    }
  }
}

module.exports = data

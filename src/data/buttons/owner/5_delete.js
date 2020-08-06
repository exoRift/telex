const {
  Await
} = require('cyclone-engine')

const data = {
  name: 'Delete',
  emoji: '❌',
  action: ({ agent, msg }) => {
    return agent.attachments.db('rooms')
      .select(['name', 'pass'])
      .where('owner', msg.channel.guild.id)
      .then(([{ name, pass }]) => {
        return {
          content: `Are you sure you want to delete **${name}**? Please type your room password to confirm (Cancels in 10 seconds):`,
          options: {
            awaits: new Await({
              options: {
                timeout: 10000,
                args: [{ name: 'password', mand: true }]
              },
              action: ({ agent, msg: response, args: [password], triggerResponse }) => {
                if (password === pass) {
                  triggerResponse.delete().catch((ignore) => ignore)

                  response.delete().catch((ignore) => ignore)
                  msg.delete().catch((ignore) => ignore)

                  return agent.attachments.deleteRoom(name).then(() => `Room **${name}** deleted.`)
                } else return '`Password incorrect.`'
              }
            })
          }
        }
      })
  }
}

module.exports = data

const {
  Await
} = require('cyclone-engine')

const {
  kick
} = require('../../utils/alerts/')

const data = {
  name: 'Kick',
  emoji: '👢',
  action: () => {
    return {
      content: 'Type the name of the guild you want to kick from your room (Cancels in 10 seconds):',
      options: {
        awaits: new Await({
          options: {
            timeout: 10000,
            args: [{ name: 'guild', mand: true }]
          },
          action: async ({ agent, msg, args: [guildName], triggerResponse }) => {
            triggerResponse.delete().catch((ignore) => ignore)

            const target = agent.client.guilds.find((g) => g.name.toLowerCase() === guildName.toLowerCase())

            if (target) {
              return agent.attachments.db('rooms')
                .select('name')
                .where('owner', msg.channel.guild.id)
                .then(([{ name }]) => agent.attachments.db('guilds')
                  .select('id')
                  .where({
                    id: target.id,
                    room: name
                  })
                  .then(([guildData]) => {
                    if (guildData) {
                      agent.attachments.transmit({ room: name, msg: kick({ guildName: target.name }) })
                        .then(() => agent.attachments.db('guilds')
                          .delete()
                          .where('id', target.id))
                        .then(() => msg.delete().catch((ignore) => ignore))
                    } else return `\`${target.name} is not in your room.\``
                  }))
            } else return `\`Could not find a guild named ${guildName}.\``
          }
        })
      }
    }
  }
}

module.exports = data

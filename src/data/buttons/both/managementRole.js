const {
  Await
} = require('cyclone-engine')

const data = {
  name: 'Management Role',
  value: ({ guild, guildData }) => guild.roles.get(guildData.adminrole) ? `<@&${guildData.adminrole}>` : 'None',
  emoji: '🎩',
  action: ({ msg }) => {
    return {
      content: 'Type the name of the role you want to grant access to (Cancels after 10 seconds, `none` for no role):',
      options: {
        awaits: new Await({
          options: {
            timeout: 10000,
            args: [{ name: 'name', mand: true }]
          },
          action: async ({ agent, msg: response, args: [name], triggerResponse }) => {
            triggerResponse.delete().catch((ignore) => ignore)

            name = name.toLowerCase()

            const role = msg.channel.guild.roles.find((r) => r.name.toLowerCase() === name)

            if (role || name === 'none') {
              return agent.attachments.db('guilds')
                .select('room')
                .where('id', msg.channel.guild.id)
                .then(([{ room }]) => agent.attachments.db('guilds')
                  .update('adminrole', name === 'none' ? null : role.id)
                  .where('id', msg.channel.guild.id)
                  .then(async () => {
                    response.delete().catch((ignore) => ignore)

                    msg.edit(await agent.attachments.buildPanel(room, msg.channel.guild.id)).catch((ignore) => ignore)
                  }))
            } else return '`Could not find role.`'
          }
        })
      }
    }
  }
}

module.exports = data

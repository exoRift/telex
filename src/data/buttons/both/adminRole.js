const {
  Await
} = require('cyclone-engine')

const data = {
  name: 'Admin Role',
  value: ({ guild, guildData }) => guild.roles.get(guildData.adminrole) ? `<@&${guildData.adminrole}>` : 'None',
  emoji: '🎩',
  action: ({ msg }) => {
    return {
      content: 'Type the name of the role you want to grant admin access to (Cancels after 10 seconds, `none` for no role):',
      options: {
        awaits: new Await({
          options: {
            timeout: 10000,
            args: [{ name: 'name', mand: true }]
          },
          action: async ({ agent, msg: response, args: [name], triggerResponse }) => {
            await triggerResponse.delete().catch((ignore) => ignore)

            const role = msg.channel.guild.roles.find((r) => r.name.toLowerCase() === name.toLowerCase())

            if (role || name.toLowerCase() === 'none') {
              await agent.attachments.db('guilds')
                .update('adminrole', name.toLowerCase() === 'none' ? null : role.id)
                .where('id', msg.channel.guild.id)
                .then(() => agent.attachments.db('guilds')
                  .select('room')
                  .where('id', msg.channel.guild.id))
                .then(async ([guildData]) => {
                  await response.delete().catch((ignore) => ignore)

                  await msg.edit(await agent.attachments.buildPanel(agent.client, agent.attachments.db, guildData.room, msg.channel.guild.id)).catch((ignore) => ignore)
                })
            } else return `\`Could not find a role named "${name}"\``
          }
        })
      }
    }
  }
}

module.exports = data

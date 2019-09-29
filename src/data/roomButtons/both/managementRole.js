const {
  Await
} = require('cyclone-engine')

const data = {
  name: 'Management Role',
  value: ({ guild, guildData }) => guild.roles.get(guildData.adminrole) ? `<@&${guildData.adminrole}>` : 'None',
  emoji: '🎩',
  action: ({ msg }) => {
    return {
      content: 'Type the name of the role you want to grant access to (Cancels after 10 seconds):',
      options: {
        wait: new Await({
          options: {
            timeout: 10000,
            args: [{ name: 'roleName', mand: true }]
          },
          action: async ({ agent, msg: response, args: [roleName], knex }) => {
            const role = response.channel.guild.roles.find((r) => r.name === roleName)

            const {
              room
            } = await knex.get({
              table: 'guilds',
              columns: 'room',
              where: {
                id: msg.channel.guild.id
              }
            })

            if (role) {
              return knex.update({
                table: 'guilds',
                where: {
                  id: msg.channel.guild.id
                },
                data: {
                  adminrole: role.id
                }
              }).then(async () => {
                msg.edit(await agent.buildPanel(room, msg.channel.guild.id)).catch((ignore) => ignore)
                response.delete().catch((ignore) => ignore)
              })
            } else return '`Could not find role.`'
          }
        })
      }
    }
  }
}

module.exports = data

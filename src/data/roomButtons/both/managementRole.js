const { Await } = require('cyclone-engine')

const data = {
  name: 'Management Role',
  value: ({ msg, guildData }) => msg.channel.guild.roles.get(guildData.adminrole) ? msg.channel.guild.roles.get(guildData.adminrole).name : 'None',
  emoji: '🎩',
  action: () => {
    return {
      content: 'Type the name of the role you want to grant access to (Cancels after 10 seconds):',
      wait: new Await({
        options: {
          timeout: 10000,
          args: [{ name: 'roleName', mand: true }]
        },
        action: ({ msg, args: [roleName], knex }) => {
          const role = msg.channel.guild.roles.find((r) => r.name === roleName)

          if (role) {
            return knex.update({
              table: 'guilds',
              where: {
                id: msg.channel.guild.id
              },
              data: {
                adminrole: role.id
              }
            }).then(() => `**${roleName}** has been granted access to the room management panel.`)
          } else return '`Could not find role.`'
        }
      })
    }
  }
}

module.exports = data

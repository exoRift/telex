const {
  Await
} = require('cyclone-engine')

const data = {
  name: 'Guild Abbreviation',
  value: ({ guildData }) => guildData.abbreviation || 'None',
  emoji: '🔰',
  action: () => {
    return {
      content: 'Type your new abbreviation for transmitted messages (Cancels after 10 seconds):',
      wait: new Await({
        options: {
          timeout: 10000,
          args: [{ name: 'abbreviation', mand: true }]
        },
        action: ({ msg, args: [abbreviation], knex }) => {
          if (abbreviation.length > 5) return '`Abbreviation too long.`'
          return knex.update({
            table: 'guilds',
            where: {
              id: msg.channel.guild.id
            },
            data: {
              abbreviation
            }
          }).then(() => `Abbreviation changed to \`${abbreviation}\``)
        }
      })
    }
  }
}

module.exports = data

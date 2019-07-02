const {
  Command
} = require('cyclone-engine')

const data = {
  name: 'list',
  action: async ({ client, msg, knex }) => {
    const guilds = await knex.select({
      table: 'guilds',
      columns: ['id', 'room', 'abbreviation']
    })

    const room = await knex.get({
      table: 'rooms',
      columns: ['name', 'owner'],
      where: {
        name: guilds.find((g) => g.id === msg.channel.guild.id).room
      }
    })

    return '```\n' +
      guilds.reduce((a, e) => e.room === room.name ? `${a}${(e.id === room.owner ? '👑 ' : '')}${client.guilds.get(e.id).name} - ${e.abbreviation}\n` : a, '') +
      '```'
  }
}

module.exports = new Command(data)

const { Command } = require('cyclone-engine')

const data = {
  name: 'list',
  desc: 'List all the guilds in your room and their abbreviations',
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
      guilds.reduce((a, g) => g.room === room.name ? `${a}${(g.id === room.owner ? '👑 ' : '')}${client.guilds.get(g.id).name} - ${g.abbreviation}\n` : a, '') +
      '```'
  }
}

module.exports = new Command(data)

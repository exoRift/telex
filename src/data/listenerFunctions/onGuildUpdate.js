const {
  abbreviate
} = require('../utils.js')

module.exports = (agent, guild, oldGuild) => {
  if (guild.name !== oldGuild.name) {
    agent._knex.update({
      table: 'guilds',
      where: {
        guild: guild.id
      },
      data: {
        abbreviation: abbreviate(guild.name)
      }
    }).catch((ignore) => ignore)
  }
}

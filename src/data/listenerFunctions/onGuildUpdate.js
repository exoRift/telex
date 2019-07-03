const { abbreviate } = require('../utils.js')

module.exports = function (guild, oldGuild) {
  if (guild.name !== oldGuild.name) {
    this._knex.update({
      table: 'guilds',
      where: {
        id: guild.id
      },
      data: {
        abbreviation: abbreviate(guild.name)
      }
    }).catch((ignore) => ignore)
  }
}

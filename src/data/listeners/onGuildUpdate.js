const {
  abbreviate
} = require('../utils/')

module.exports = function (guild, oldGuild) {
  if (guild.name !== oldGuild.name) {
    return this.attachments.db('guilds')
      .update('abbreviation', abbreviate(guild.name))
      .where('id', guild.id)
  }
}

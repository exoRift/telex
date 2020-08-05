/**
 * Run when a guild changes its name
 * @async
 * @this  {Agent}               The agent
 * @param {Eris.Guild} guild    The current guild data
 * @param {Eris.Guild} oldGuild The old guild data
 */
async function onGuildUpdate (guild, oldGuild) {
  if (guild.name !== oldGuild.name) {
    return this.attachments.db('guilds')
      .update('abbreviation', this.attachments.abbreviate(guild.name))
      .where('id', guild.id)
  }
}

module.exports = onGuildUpdate

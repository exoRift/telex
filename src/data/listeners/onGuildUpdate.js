const {
  routines
} = require('../util/')

/**
 * Run when a guild changes its name
 * @async
 * @param {Knex}       db       The Knex client
 * @param {Eris.Guild} guild    The current guild data
 * @param {Eris.Guild} oldGuild The old guild data
 */
async function onGuildUpdate (db, guild, oldGuild) {
  if (guild.name !== oldGuild.name) {
    return db('guilds')
      .update('abbreviation', routines.abbreviate(guild.name))
      .where('id', guild.id)
  }
}

module.exports = onGuildUpdate

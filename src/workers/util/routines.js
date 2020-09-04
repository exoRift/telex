const {
  onChannelUnavailable,
  onGuildDelete
} = require('../../data/listeners/')

/**
 * Prune the database from guilds that are no longer available
 * @param   {Eris.Client}  client The Eris client
 * @param   {Knex}         db     The Knex client
 * @param   {Eris.Guild[]} guilds The guilds the bot is in
 * @returns {Promise}
 */
function pruneDB (client, db, guilds) {
  return db('guilds')
    .select(['id', 'channel'])
    .then((res) => {
      for (const guildData of res) {
        const guild = guilds.find((g) => g.id === guildData.id)

        if (guild) onChannelUnavailable(guild) // Check if channel unavailable
        else {
          guildData.name = 'deleted-guild'

          onGuildDelete(guildData)
        }
      }
    })
}

module.exports = {
  pruneDB
}

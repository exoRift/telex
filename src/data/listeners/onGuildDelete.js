const {
  routines
} = require('../util/')

/**
 * Runs when a guild is deleted or the bot is kicked
 * @async
 * @param {Eris.Client} client The Eris client
 * @param {Knex}        db     The Knex client
 * @param {Eris.Guild}  guild  The guild
 */
async function onGuildDelete (client, db, guild) {
  const [guildData] = await db('guilds')
    .select('room')
    .where('id', guild.id)

  if (guildData) {
    const [roomData] = await db('rooms')
      .select('owner')
      .where('name', guildData.room)

    routines.log('prune', `Guild ${guild.id} pruned (Deleted)`)

    if (guild.id === roomData.owner) routines.deleteRoom(client, db, guildData.room, guild.id)
    else routines.leaveRoom(client, db, guild.id)
  }
}

module.exports = onGuildDelete

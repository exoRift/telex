const {
  routines
} = require('../util/')

/**
 * Runs when a channel becomes unavailable
 * @async
 * @param {Eris.Client} client The Eris client
 * @param {Knex}        db     The Knex client
 * @param {Eris.Guild}  guild  The guild
 */
async function onChannelUnavailable (client, db, guild) {
  const [guildData] = await db('guilds')
    .select(['channel', 'room'])
    .where('id', guild.id)

  if (guildData) {
    const channel = guild.channels.get(guildData.channel)

    if (!routines.isValidChannel(client, channel)) {
      const newChannel = routines.getValidChannel(client, guild)

      if (newChannel) {
        return db('guilds')
          .update('channel', newChannel.id)
          .where('id', guild.id)
          .then(() => newChannel.createMessage(`**Your transmission channel has changed to \`${channel.name}\` due to permission changes.**`))
      } else {
        const [roomData] = await db('rooms')
          .select('owner')
          .where('name', guildData.room)

        routines.log('prune', `Guild ${guild.id} pruned (No available channel)`)

        if (guild.id === roomData.owner) routines.deleteRoom(client, db, guildData.room, guild.id)
        else routines.leaveRoom(client, db, guild.id)
      }
    }
  }
}

module.exports = onChannelUnavailable

/**
 * Runs when a guild is deleted or the bot is kicked
 * @async
 * @this  {Agent}            The agent
 * @param {Eris.Guild} guild The guild
 */
async function onGuildDelete (guild) {
  const [guildData] = await this.attachments.db('guilds')
    .select('room')
    .where('id', guild.id)

  if (guildData) {
    const [roomData] = await this.attachments.db('rooms')
      .select('owner')
      .where('name', guildData.room)

    if (guild.id === roomData.owner) return this.attachments.deleteRoom(guildData.room, guild.id)
    else this.attachments.leaveRoom(guild.id)
  }
}

module.exports = onGuildDelete

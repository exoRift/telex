/**
 * Runs when a channel becomes unavailable
 * @async
 * @this  {Agent}            The agent
 * @param {Eris.Guild} guild The guild
 */
async function onChannelUnavailable (guild) {
  const [guildData] = await this.attachments.db('guilds')
    .select(['channel', 'room'])
    .where('id', guild.id)

  if (guildData) {
    const channel = guild.channels.get(guildData.channel)

    if (!this.attachments.isValidChannel(channel)) {
      const newChannel = this.attachments.getValidChannel(guild)

      if (newChannel) {
        return this.attachments.db('guilds')
          .update('channel', newChannel.id)
          .where('id', guild.id)
          .then(() => newChannel.createMessage(`**Your transmission channel has changed to 1${channel.name}1 due to permission changes.**`))
      } else {
        const [roomData] = await this.attachments.db('rooms')
          .select('owner')
          .where('name', guildData.room)

        if (guild.id === roomData.owner) this.attachments.deleteRoom(guildData.room, guild.id)
        else this.attachments.leaveRoom(guild.id)
      }
    }
  }
}

module.exports = onChannelUnavailable

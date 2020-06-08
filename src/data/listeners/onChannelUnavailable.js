const {
  leave
} = require('../utils/alerts/')

const {
  deleteRoom
} = require('../utils/')

module.exports = function (guild) {
  return this.attachments.db('guilds')
    .select(['channel', 'room'])
    .where('id', guild.id)
    .then(([guildData]) => {
      if (guildData) {
        const channel = guild.channels.get(guildData.channel)

        if (!channel || !channel.permissionsOf(this.client.user.id).has('sendMessages')) {
          const newChannel = this.attachments.getValidChannel(guild)

          if (newChannel) {
            return this.attachments.db('guilds')
              .update('channel', newChannel.id)
              .where('id', guild.id)
              .then(() => newChannel.createMessage(`**Your transmission channel has changed to ${channel.name} due to permission changes.**`))
          } else {
            return this.attachments.db('rooms')
              .select('owner')
              .where('name', guildData.room)
              .then(([{ owner }]) => {
                if (guild.id === owner) deleteRoom(this.attachments.db, guildData.room, guild.id)
                else {
                  return this.attachments.db('guilds')
                    .delete()
                    .where('id', guild.id)
                    .then(() => this.transmit({ room: guildData.room, msg: leave({ guildName: guild.name }) }))
                }
              })
          }
        }
      }
    })
}

const {
  leave
} = require('../utils/alerts/')

module.exports = function (guild) {
  return this.attachments.db('guilds')
    .select('room')
    .where('id', guild.id)
    .then(([guildData]) => {
      if (guildData) {
        return this.attachments.db('rooms')
          .select('owner')
          .where('name', guildData.room)
          .then(([{ owner }]) => {
            if (guild.id === owner) return this.attachments.deleteRoom(guildData.room, guild.id)
            else {
              return this.attachments.db('guilds')
                .delete()
                .where('id', guild.id)
                .then(() => this.attachments.transmit({ room: guildData.room, msg: leave({ guildName: guild.name }) }))
            }
          })
      }
    })
}

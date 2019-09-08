const {
  deleteRoom,
  leave
} = require('../alerts/')

module.exports = async function (guild) {
  const data = await this._knex.get({
    table: 'guilds',
    columns: ['channel', 'room'],
    where: {
      id: guild.id
    }
  })

  if (data) {
    const channel = guild.channels.get(data.channel)

    if (!channel.permissionsOf(this._client.user.id).has('sendMessages')) {
      const newChannel = guild.channels.find((c) => c.permissionsOf(this._client.user.id).has('sendMessages') && !c.type)
      if (newChannel) {
        this._knex.update({
          table: 'guilds',
          where: {
            id: guild.id
          },
          data: {
            channel: newChannel.id
          }
        }).then(() => newChannel.createMessage(`**Your transmission channel has changed to ${channel.name} due to permission changes.**`))
      } else {
        const {
          owner
        } = await this._knex.get({
          table: 'rooms',
          columns: 'owner',
          where: {
            name: data.room
          }
        })

        if (guild.id === owner) {
          await this._knex.delete({
            table: 'guilds',
            where: {
              id: guild.id
            }
          })

          this.transmit({ room: data.room, msg: deleteRoom({ roomName: data.room }) }).then(async () => {
            await this._knex.delete({
              table: 'rooms',
              where: {
                name: data.room
              }
            })
            await this._knex.delete({
              table: 'guilds',
              where: {
                room: data.room
              }
            })
          })
        } else {
          this._knex.delete({
            table: 'guilds',
            where: {
              id: guild.id
            }
          }).then(() => this.transmit({ room: data.room, msg: leave({ guildName: guild.name }) }))
        }
      }
    }
  }
}

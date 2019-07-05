const {
  deleteRoom,
  leave
} = require('../alerts')

module.exports = async function (guild) {
  const data = await this._knex.get({
    table: 'guilds',
    columns: 'room',
    where: {
      id: guild.id
    }
  })

  if (data) {
    const { owner } = await this._knex.get({
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

exports.up = function (knex) {
  return knex.schema
    .createTable('rooms', (table) => {
      table.string('name', 20).primary()
      table.string('pass', 15).notNullable()
      table.string('owner', 255).notNullable()
    })
    .createTable('guilds', (table) => {
      table.string('id', 255).primary()
      table.string('channel', 255).notNullable()

      table.string('room', 10).notNullable()
      table.foreign('room')
        .references('name')
        .inTable('rooms')
        .onUpdate('cascade')
        .onDelete('cascade')

      table.string('adminrole', 255).nullable()
      table.string('callsign', 5).notNullable()
    })
}

exports.down = function (knex) {
  return knex.schema
    .dropTable('guilds')
    .dropTable('rooms')
}

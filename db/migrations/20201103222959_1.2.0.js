exports.up = function (knex) {
  return knex.schema
    .createTable('rooms', (table) => {
      table.string('name', 20).primary()
      table.string('pass', 15).notNullable()
      table.string('owner', 255).notNullable()
    })
    .createTable('guilds', (table) => {
      table.string('id', 255).primary()
      table.string('channel', 255).nullable()

      table.string('room', 20).nullable()
      table.foreign('room')
        .references('name')
        .inTable('rooms')
        .onUpdate('cascade')
        .onDelete('set null')

      table.string('adminrole', 255).nullable()
      table.string('callsign', 5).notNullable()
      table.boolean('quoting')
    })
}

exports.down = function (knex) {
  return knex.schema
    .dropTable('guilds')
    .dropTable('rooms')
}

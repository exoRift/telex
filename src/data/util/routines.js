const {
  ReactCommand,
  ReactInterface
} = require('cyclone-engine')

const alerts = require('./alerts/')

/**
 * Abbreviate a name
 * @param   {String} name The name to abbreviate
 * @returns {String}      The abbreviated result
 */
function abbreviate (name) {
  return name.split(' ').reduce((a, w) => a + w[0], '').substring(0, 5)
}

/**
 * Build a room management panel
 * @async
 * @param   {Eris.Client}     client The Eris client
 * @param   {Knex}            db     The Knex client
 * @param   {String}          room   The name of the room
 * @param   {String}          guild  The ID of the guild
 * @returns {Promise<Object>}        The message data containing the panel
 */
async function buildPanel (client, db, room, guild) {
  const {
    owner,
    member
  } = require('../buttons')

  const [roomData] = await db('rooms')
    .select()
    .where('name', room)
  const [guildData] = await db('guilds')
    .select()
    .where('id', guild)

  const guildObject = client.guilds.get(guild)

  const isOwner = guild === roomData.owner
  const buttons = isOwner ? owner : member

  return {
    embed: {
      author: {
        name: 'Room Control Panel',
        icon_url: guildObject.iconURL
      },
      title: `**${roomData.name}**`,
      thumbnail: {
        url: client.guilds.get(roomData.owner).iconURL
      },
      color: isOwner ? 0x4C0099 : undefined,
      fields: buttons.map((b) => {
        return {
          name: `${b.emoji} **${b.name}**`,
          value: b.value ? b.value({ client: client, guild: guildObject, guildData, roomData }) : '​',
          inline: true
        }
      }),
      footer: {
        text: `${isOwner ? '👑 ' : ''}You are ${isOwner ? 'the owner' : 'a member'} of the room`
      }
    },
    options: {
      reactInterface: new ReactInterface({
        buttons: buttons.map((b) => new ReactCommand(b)),
        options: {
          authLevel: 1,
          removeReaction: true
        }
      })
    }
  }
}

/**
 * Compile Discord messages into content suitable for transmitting
 * @async
 * @param   {Knex}            db        The Knex client
 * @param   {Eris.Message}    msg       The message to compile
 * @param   {Number}          [level=0] The authority level of the author
 * @returns {Promise<Object>}           An object containing the transmission data
 */
async function compileMessage (db, msg, level = 0) {
  if (msg.channel.type) throw Error('Invalid channel.')

  const [guildData] = await db('guilds')
    .select(['channel', 'room', 'callsign'])
    .where('id', msg.channel.guild.id)

  if (guildData) {
    const [roomData] = await db('rooms')
      .select('owner')
      .where('name', guildData.room)

    const content = (level > 0
      ? level === Infinity
        ? msg.channel.guild.id === roomData.owner
          ? '🔻 '
          : '🔶 '
        : '🔷 '
      : '') +
      `*${guildData.callsign}* **${msg.author.username}#${msg.author.discriminator}**` +
      `${msg.content ? ' ' + msg.content : ''}${msg.attachments.length ? msg.attachments.reduce((a, attachment) => a + attachment.url, '\n') : ''}`

    if (content.length > 2000) return msg.channel.createMessage(alerts.lengthError(msg))
    else return { room: guildData.room, msg: content, exclude: msg.channel.guild.id }
  } else throw Error('Guild is not in a room.')
}

/**
 * Create a room
 * @async
 * @param {Knex}             db      The Knex client
 * @param {String}           name    The name of the room
 * @param {String}           pass    The password of the room
 * @param {Eris.Guild}       owner   The owner of the room
 * @param {Eris.TextChannel} channel The transmission channel of the owner
 */
async function createRoom (db, name, pass, owner, channel) {
  const [existing] = await db('rooms')
    .select('name')
    .whereRaw('LOWER(name) = ?', name.toLowerCase())

  if (existing) throw Error('name taken')

  await db('rooms')
    .insert({
      name,
      pass,
      owner: owner.id
    })

  await db('guilds')
    .insert({
      id: owner.id,
      channel: channel.id,
      room: name,
      callsign: abbreviate(owner.name)
    })

  log('creation', `${owner.id} created the room \`${name}\``)
}

/**
 * Completely delete a room from all tables
 * @async
 * @param {Eris.Client} client  The Eris client
 * @param {Knex}        db      The Knex client
 * @param {String}      room    The name of the room to delete
 * @param {String}      exclude The ID of a guild that is excluded from the announcement
 */
function deleteRoom (client, db, room, exclude) {
  return transmit(client, db, { room, msg: alerts.deleteRoom({ roomName: room }), exclude })
    .then(() => db('rooms')
      .delete()
      .where('name', room))
    .then(() => log('deletion', `\`${room}\` was deleted`))
}

/**
 * Get a valid channel that can be used for a transmission channel
 * @param   {Eris.Client}                client The Eris client
 * @param   {Eris.Guild}                 guild  The guild to check
 * @param   {Eris.TextChannel}           prio   The inital channel to priortitize if possible
 * @returns {Eris.TextChannel|undefined}        A valid channel
 */
function getValidChannel (client, guild, prio) {
  return prio && isValidChannel(client, prio)
    ? prio
    : guild.channels.find((c) => isValidChannel(client, c)) || null
}

/**
 * Check if a channel is a transmission channel
 * @param  {Knex}             db      The Knex client
 * @param  {Eris.TextChannel} channel The channel
 * @return {Promise<Boolean>}         Whether the channel is a transmission channel or not
 */
function isTransmissionChannel (db, channel) {
  return db('guilds')
    .select('id')
    .where('channel', channel.id)
    .then(([guildData]) => Boolean(guildData))
}

/**
 * Check if the client possesses read and write permissions in a channel
 * @param   {Eris.Client}  client  The Eris client
 * @param   {Eris.Channel} channel The channel
 * @returns {Boolean}              Whether the client possesses the proper permissions or not
 */
function isValidChannel (client, channel) {
  return channel.permissionsOf(client.user.id).has('readMessages') && channel.permissionsOf(client.user.id).has('sendMessages') && !channel.type
}

/**
 * Make a guild join a room
 * @param {Eris.Client}      client         The Eris client
 * @param {Knex}             db             The Knex client
 * @param {Eris.Guild}       guild          The guild
 * @param {Eris.TextChannel} channel        The transmission channel
 * @param {String}           room           The room to join
 * @param {Number}           [guildCount=0] The number of guilds in the room
 */
function joinRoom (client, db, guild, channel, room, guildCount = 0) {
  return db('guilds')
    .insert({
      id: guild.id,
      channel: channel.id,
      room: room,
      callsign: abbreviate(guild.name)
    })
    .then(transmit(client, db, {
      room: room,
      msg: alerts.join({ guildName: guild.name, guildsInRoom: guildCount })
    }))
    .then(() => log('join', `${guild.id} joined \`${room}\``))
}

/**
 * Make a guild leave its room
 * @async
 * @param {Eris.Client} client The Eris client
 * @param {Knex}        db     The knex client
 * @param {String}      guild  The ID of the guild to make leave its room
 */
async function leaveRoom (client, db, guild) {
  const [guildData] = db('guilds')
    .select('room')
    .where('id', guild)

  if (guildData) {
    return db('guilds')
      .delete()
      .where('id', guild.id)
      .then(() => transmit(client, db, { room: guildData.room, msg: alerts.leave({ guildName: guild.name }) }))
      .then(() => log('leave', `${guild} left \`${guildData.room}\``))
  } else throw Error('Guild is not in a room')
}

function log (action, message) {
  console.log(`[TELEX] ${action.toUpperCase()}: ${message}`)
}

/**
 * Transmit a message across guilds in a room
 * @async
 * @param   {Eris.Client}              client            The Eris client
 * @param   {Knex}                     db                The Knex client
 * @param   {Object}                   data              The data
 * @prop    {String}                   data.room         The room to transmit the message to
 * @prop    {Object}                   data.msg          The message to transmit
 * @prop    {String}                   [data.exclude=''] The ID of the guild to exclude from the transmission
 * @returns {Promise<Eris.Message[]>}                    An array of all messages sent
 */
async function transmit (client, db, { room, msg, exclude = '' }) {
  const channels = await db('guilds')
    .select('channel')
    .where('room', room)
    .whereNot('id', exclude)

  const promises = []

  for (const { channel } of channels) promises.push(client.createMessage(channel, msg))

  return Promise.all(promises)
}

module.exports = {
  abbreviate,
  buildPanel,
  compileMessage,
  createRoom,
  deleteRoom,
  getValidChannel,
  isTransmissionChannel,
  isValidChannel,
  joinRoom,
  leaveRoom,
  log,
  transmit
}

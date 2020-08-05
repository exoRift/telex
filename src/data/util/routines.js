const {
  ReactCommand,
  ReactInterface
} = require('cyclone-engine')

const alerts = require('./alerts/')

const {
  onChannelUnavailable,
  onGuildDelete
} = require('../../data/listeners/')

/**
 * Abbreviate a name
 * @param   {String} name The name to abbreviate
 * @returns {String}      The abbreviated result
 */
function abbreviate (name) {
  return name.split(' ').reduce((a, w) => a + w[0], '')
}

/**
 * Build a room management panel
 * @async
 * @this    {Agent}                 The agent
 * @param   {String}          room  The name of the room
 * @param   {String}          guild The ID of the guild
 * @returns {Promise<Object>}       The message data containing the panel
 */
async function buildPanel (room, guild) {
  const {
    owner,
    member
  } = require('../buttons')

  const [roomData] = await this.attachments.db('rooms')
    .select()
    .where('name', room)
  const [guildData] = await this.attachments.db('guilds')
    .select()
    .where('id', guild)

  const guildObject = this.client.guilds.get(guild)

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
        url: this.client.guilds.get(roomData.owner).iconURL
      },
      color: isOwner ? 4980889 : undefined,
      fields: buttons.map((b) => {
        return {
          name: `${b.emoji} **${b.name}**`,
          value: b.value ? b.value({ client: this.client, guild: guildObject, guildData, roomData }) : '​',
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
 * @this    {Agent}               The agent
 * @param   {Eris.Message}    msg The message to compile
 * @returns {Promise<Object>}     An object containing the transmission data
 */
async function compileMessage (msg) {
  if (msg.channel.type) throw Error('Invalid channel.')

  const [guildData] = this.attachments.db('guilds')
    .select(['channel', 'room', 'abbreviation'])
    .where('id', msg.channel.guild.id)

  if (guildData) {
    const [roomData] = await this.attachments.db('rooms')
      .select('owner')
      .where('name', guildData.room)

    const content = (msg.channel.guild.id === roomData.owner ? '👑 ' : '') +
      `*${guildData.abbreviation}* **${msg.author.username}#${msg.author.discriminator}**` +
      `${msg.content ? ' ' + msg.content : ''}${msg.attachments.length ? msg.attachments.reduce((a, attachment) => a + attachment.url, '\n') : ''}`

    if (content.length > 2000) return msg.channel.createMessage(alerts.lengthError(msg))
    else return { room: guildData.room, msg: content, exclude: msg.channel.guild.id }
  } else throw Error('Guild is not in a room.')
}

/**
 * Create a room
 * @async
 * @this  {Agent}                The agent
 * @param {String}       name    The name of the room
 * @param {String}       pass    The password of the room
 * @param {Eris.Guild}   owner   The owner of the room
 * @param {Eris.Channel} channel The transmission channel of the owner
 */
async function createRoom (name, pass, owner, channel) {
  await this.attachments.db('rooms')
    .insert({
      name,
      pass,
      owner: owner.id
    })

  await this.attachments.db('guilds')
    .insert({
      id: owner.id,
      channel: channel.id,
      room: name,
      abbreviation: this.attachments.abbreviate(owner.name)
    })
}

/**
 * Completely delete a room from all tables
 * @async
 * @this  {Agent}          The agent
 * @param {String} room    The name of the room to delete
 * @param {String} exclude The ID of a guild that is excluded from the announcement
 */
function deleteRoom (room, exclude) {
  return this.attachments.transmit({ room, msg: alerts.deleteRoom({ roomName: room }), exclude })
    .then(() => this.attachments.db('rooms')
      .delete()
      .where('name', room))
    .then(() => this.attachments.db('guilds')
      .delete()
      .where('room', room))
}

/**
 * Get a valid channel that can be used for a transmission channel
 * @this    {Agent}                            The agent
 * @param   {Eris.Guild}                 guild The guild to check
 * @param   {Eris.TextChannel}           prio  The inital channel to priortitize if possible
 * @returns {Eris.TextChannel|undefined}       A valid channel
 */
function getValidChannel (guild, prio) {
  return prio && isValidChannel(this.client, prio)
    ? prio
    : guild.channels.find((c) => isValidChannel(this.client, c))
}

function pruneDB () {
  this.attachments.dbl.postStats(this.client.guilds.size)

  console.log('Initiating Prune')

  this.attachments.db('guilds')
    .select(['id', 'channel'])
    .then((res) => {
      for (const guildData of res) {
        const guild = this.client.guilds.get(guildData.id)

        if (guild) onChannelUnavailable.call(this, guild) // Check if channel unavailable
        else {
          guildData.name = 'deleted-guild'

          onGuildDelete.call(this, guildData)
        }
      }
    })
}

/**
 * Check if the client possesses read and write permissions in a channel
 * @param   {Eris.Client}  client  The client
 * @param   {Eris.Channel} channel The channel
 * @returns {Boolean}              Whether the client possesses the proper permissions or not
 */
function isValidChannel (client, channel) {
  return channel.permissionsOf(client.user.id).has('readMessages') && channel.permissionsOf(client.user.id).has('sendMessages') && !channel.type
}

/**
 * Make a guild leave its room
 * @async
 * @this  {Agent}        The agent
 * @param {String} guild The guild to make leave its room
 */
async function leaveRoom (guild) {
  const [guildData] = this.attachments.db('guilds')
    .select('room')
    .where('id', guild)

  if (guildData) {
    return this.attachments.db('guilds')
      .delete()
      .where('id', guild.id)
      .then(() => this.transmit({ room: guildData.room, msg: alerts.leave({ guildName: guild.name }) }))
  } else throw Error('Guild is not in a room')
}

/**
 * Transmit a message across guilds in a room
 * @async
 * @this    {Agent}                                      The agent
 * @param   {Object}                   data              The data
 * @prop    {String}                   data.room         The room to transmit the message to
 * @prop    {Object}                   data.msg          The message to transmit
 * @prop    {String}                   [data.exclude=''] The ID of the guild to exclude from the transmission
 * @returns {Promise<Eris.Message[]>}                    An array of all messages sent
 */
async function transmit ({ room, msg, exclude = '' }) {
  const channels = await this.attachments.db('guilds')
    .select('channel')
    .where('room', room)
    .whereNot('id', exclude)

  if (channels.length) {
    const promises = []

    for (const { channel } of channels) promises.push(this.client.createMessage(channel, msg))

    return Promise.all(promises)
  } else throw Error('No channels to transmit')
}

module.exports = {
  abbreviate,
  buildPanel,
  compileMessage,
  createRoom,
  deleteRoom,
  getValidChannel,
  pruneDB,
  isValidChannel,
  leaveRoom,
  transmit
}

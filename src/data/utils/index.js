const {
  readdirSync
} = require('fs')
const {
  join
} = require('path')

const {
  ReactCommand,
  ReactInterface
} = require('cyclone-engine')

const filenameRegex = /(.+?)\.js$/

/**
 * Require every js file in a directory and push them to an array
 * @param   {String} path The directory to read
 * @returns {*[]}         The resulting array
 */
function requireDirToArray (path) {
  const content = []
  const files = readdirSync(path)

  for (let i = 0; i < files.length; i++) {
    if (files[i] !== 'index.js') content.push(require(join(path, files[i])))
  }

  return content
}

/**
 * Require every js file in a directory and return an object with the filenames as keys and the exports as values
 * @param   {String} path The directory to read
 * @returns {Object}      The resulting object
 */
function requireDirToObject (path) {
  const content = {}
  const files = readdirSync(path)

  for (let i = 0; i < files.length; i++) {
    if (files[i] !== 'index.js') content[files[i].match(filenameRegex)[1]] = require(join(path, files[i]))
  }

  return content
}

/**
 * Compile Discord messages into content suitable for transmitting
 * @async
 * @this    agent
 * @param   {Eris.Message}    msg The message to compile
 * @returns {Promise<Object>}     An object containing the transmission data
 */
async function compileMessage (msg) {
  if (msg.channel.type) throw Error('Invalid channel.')

  return this.attachments.db('guilds')
    .select(['channel', 'room', 'abbreviation'])
    .where('id', msg.channel.guild.id)
    .then(([guildData]) => {
      if (guildData) {
        if (msg.channel.id === guildData.channel) {
          return this.attachments.db('rooms')
            .select('owner')
            .where('name', guildData.room)
            .then(([{ owner }]) => {
              const content = (msg.channel.guild.id === owner ? '👑 ' : '') +
              `*${guildData.abbreviation}* **${msg.author.username}#${msg.author.discriminator}**` +
              `${msg.content ? ' ' + msg.content : ''}${msg.attachments.length ? msg.attachments.reduce((a, attachment) => a + attachment.url, '\n') : ''}`

              if (content.length > 2000) {
                return msg.channel.createMessage({
                  embed: {
                    author: {
                      name: msg.author.username,
                      icon_url: msg.author.avatarURL,
                      url: `https://discord.com/channels/${msg.channel.guilds.id}/${msg.channel.id}/${msg.id}`
                    },
                    title: 'Message is too long to pass through.',
                    color: 16777010
                  }
                })
              } else return { room: guildData.room, msg: content, exclude: msg.channel.guild.id }
            })
        } else throw Error('Message not sent in transmission channel.')
      } else throw Error('Guild is not in a room.')
    })
}

/**
 * Transmit a message across a room
 * @this    agent
 * @param   {Object}                  data      The data for the transmission
 * @prop    {String}                  data.room The room to transmit the message to
 * @prop    {Object}                  data.msg  The message to transmit
 * @returns {Promise<Eris.Message[]>}           An array of all messages sent
 */
function transmit ({ room, msg, exclude = '' }) {
  return this.attachments.db('guilds')
    .select('channel')
    .where('room', room)
    .whereNot('id', exclude)
    .then((channels) => {
      if (channels.length) {
        const promises = []

        for (const { channel } of channels) promises.push(this.client.createMessage(channel, msg))

        return Promise.all(promises)
      }
    })
}

/**
 * Build a room management panel
 * @async
 * @this                      agent
 * @param   {String}          room  The name of the room
 * @param   {String}          guild The ID of the guild
 * @returns {Promise<Object>}       The message data containing the panel
 */
async function buildPanel (room, guild) {
  const {
    owner,
    member
  } = require('../buttons/')

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
 * Abbreviate a name
 * @param   {String} name The name to abbreviate
 * @returns {String}      The abbreviated result
 */
function abbreviate (name) {
  return name.split(' ').reduce((a, w) => a + w[0], '')
}

/**
 * Get a valid channel that can be used for a transmission channel
 * @this    agent                              The agent
 * @param   {Eris.Guild}                 guild The guild to check
 * @param   {Eris.TextChannel}           prio  The inital channel to priortitize if possible
 * @returns {Eris.TextChannel|undefined}       A valid channel
 */
function getValidChannel (guild, prio) {
  return prio && prio.permissionsOf(this.client.user.id).has('readMessages') && prio.permissionsOf(this.client.user.id).has('sendMessages')
    ? prio
    : guild.channels.find((c) => c.permissionsOf(this.client.user.id).has('readMessages') && c.permissionsOf(this.client.user.id).has('sendMessages') && !c.type)
}

/**
 * Completely delete a room from all tables
 * @this    agent             The agent
 * @param   {String}  room    The name of the room to delete
 * @param   {String}  exclude The ID of a guild that is excluded from the announcement
 * @returns {Promise}
 */
function deleteRoom (room, exclude) {
  const {
    deleteRoom: deleteRoomAlert
  } = require('./alerts/')

  return this.attachments.transmit({ room, msg: deleteRoomAlert({ roomName: room }), exclude: exclude })
    .then(() => this.attachments.db('rooms')
      .delete()
      .where('name', room))
    .then(() => this.attachments.db('guilds')
      .delete()
      .where('room', room))
}

module.exports = {
  requireDirToArray,
  requireDirToObject,
  compileMessage,
  transmit,
  buildPanel,
  abbreviate,
  getValidChannel,
  deleteRoom
}

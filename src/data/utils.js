const { readdirSync } = require('fs')
const { join } = require('path')

const filenameRegex = /(.+?)\.js$/

const links = {
  pingIcon: 'https://i.imgur.com/SCCJ8qs.gif',
  prefixIcon: 'https://i.imgur.com/GT1v7rD.png'
}
/**
 * Require every js file in a directory and push them to an array.
 * @param   {String} path The directory to read.
 * @returns {*[]}         The resulting array.
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
 * Require every js file in a directory and return an object with the filenames as keys and the exports as values.
 * @param   {String} path The directory to read.
 * @returns {Object}      The resulting object.
 */
function requireDirToObject (path) {
  const content = {}
  const files = readdirSync(path)
  for (let i = 0; i < files.length; i++) {
    if (files[i] !== 'index.js') content[files[i].match(filenameRegex)[1]] = require(join(path, files[i]))
  }
  return content
}

const statusEmojis = {
  online: '<a:Online:469626088579006464>',
  streaming: '<a:Streaming:469626088151187458>',
  dnd: '<a:DND:469626088612429824>',
  idle: '<a:Away:469626088285274172>',
  offline: '<a:Offline:469626088662892554>'
}

/**
 * Transmit a message across a room.
 * @this    agent
 * @param   {Object}                  data        The data for the transmission.
 * @prop    {String}                  data.room   The room to transmit the message to.
 * @prop    {Object}                  data.msg    The message to transmit.
 * @returns {Promise<Eris.Message[]>}             An array of all messages sent.
 */
function transmit ({ room, msg }) {
  return this._knex.select({
    table: 'guilds',
    columns: 'channel',
    where: {
      room
    }
  }).then((channels) => {
    const promises = []

    for (const channel of channels) promises.push(this._client.createMessage(channel.channel, msg))

    return Promise.all(promises)
  })
}

/**
 * Abbreviate a name.
 * @param   {String} name The name to abbreviate.
 * @returns {String}      The abbreviated result.
 */
function abbreviate (name) {
  return name.split(' ').reduce((a, e) => a + e[0], '')
}

module.exports = {
  links,
  requireDirToArray,
  requireDirToObject,
  statusEmojis,
  transmit,
  abbreviate
}

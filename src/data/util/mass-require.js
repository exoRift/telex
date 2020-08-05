const {
  readdirSync
} = require('fs')
const {
  join
} = require('path')

const filenameRegex = /(.+?)\.js$/

/**
 * Require every js file in a directory and push them to an array
 * @param   {String} path The directory to read
 * @returns {*[]}         The resulting array
 */
function toArray (path) {
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
function toObject (path) {
  const content = {}
  const files = readdirSync(path)

  for (let i = 0; i < files.length; i++) {
    if (files[i] !== 'index.js') content[files[i].match(filenameRegex)[1]] = require(join(path, files[i]))
  }

  return content
}

module.exports = {
  toArray,
  toObject
}

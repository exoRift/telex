const fs = require('fs')
const path = require('path')

const filenameRegex = /(.+?)\.js$/

/**
 * Require every js file in a directory and push them to an array
 * @param   {String} dir The directory to read
 * @returns {*[]}        The resulting array
 */
function toArray (dir) {
  const content = []
  const files = fs.readdirSync(dir)

  for (let i = 0; i < files.length; i++) {
    if (files[i] !== 'index.js') content.push(require(path.join(dir, files[i])))
  }

  return content
}

/**
 * Require every js file in a directory and return an object with the filenames as keys and the exports as values
 * @param   {String} dir The directory to read
 * @returns {Object}     The resulting object
 */
function toObject (dir) {
  const content = {}
  const files = fs.readdirSync(dir)

  for (let i = 0; i < files.length; i++) {
    if (files[i] !== 'index.js') content[files[i].match(filenameRegex)[1]] = require(path.join(dir, files[i]))
  }

  return content
}

module.exports = {
  toArray,
  toObject
}

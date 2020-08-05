const massRequire = require('./mass-require.js')

const routines = require('./routines.js')
const alerts = massRequire.toArray('./alerts/')
const emojis = require('./emojis.json')
const assets = require('./assets.json')

module.exports = {
  routines,
  alerts,
  emojis,
  assets
}

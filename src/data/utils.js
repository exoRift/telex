const { readdirSync } = require('fs')
const { join } = require('path')

const links = {
  pingIcon: 'https://i.imgur.com/SCCJ8qs.gif',
  prefixIcon: 'https://theasciicode.com.ar/ascii-codes/vertical-bar-vbar-vertical-line-vertical-slash-ascii-code-124.gif',
  helpIcon: 'http://images.clipartpanda.com/liberation-clipart-free-vector-question-mark-icon-clip-art_104760_Question_Mark_Icon_clip_art_hight.png'
}
/**
 * Require every js file in a directory.
 * @param   {String} path The directory to read.
 * @returns {*[]}         The resulting array.
 */
function readAndRequireDir (path) {
  const content = []
  const files = readdirSync(path)
  for (let i = 0; i < files.length; i++) {
    if (files[i] !== 'index.js') content.push(require(join(path, files[i])))
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

module.exports = {
  links,
  readAndRequireDir,
  statusEmojis
}

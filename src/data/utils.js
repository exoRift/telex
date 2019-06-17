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

module.exports = {
  links,
  readAndRequireDir
}

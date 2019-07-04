const templateRegex = /( +?<br>)\{DATA_HERE\}/m
const infoRegex = /</g

const {
  readdir,
  readFile,
  writeFile
} = require('fs').promises

const commands = require('../src/data/commands')

readdir('assets/templates').then((templates) => {
  for (const template of templates) {
    readFile('assets/templates/' + template, 'utf8').then((fileContent) => {
      const content = fileContent.replace(templateRegex, (match, capture) =>
        commands.reduce((a, c) => a + `\n${capture}${c.info.replace(infoRegex, '<​')}`, `${capture}Commands:\n${capture}`)
      )
      writeFile('assets/' + template, content)
    })
  }
})

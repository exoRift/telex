const {
  join
} = require('path')

const {
  Command
} = require('cyclone-engine')

const data = {
  name: 'updates',
  desc: 'View the current or a past version\'s changes to the bot',
  options: {
    args: [{ name: 'version' }]
  },
  action: ({ args: [version] }) => {
    const updates = require('../updates.json')
    const latestVer = require(join(process.cwd(), '/package.json')).version
    const ver = version || latestVer
    if (updates[ver]) return `\`\`\`${ver === latestVer ? 'swift' : ''}\n${ver} \\ ${updates[ver].date}\n-----\n${updates[ver].notes}\`\`\``
    else return '`Version does not exist.`'
  }
}

module.exports = new Command(data)

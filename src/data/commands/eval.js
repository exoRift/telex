const {
  Command
} = require('cyclone-engine')

const {
  inspect
} = require('util')

const {
  TOKEN,
  DBL_TOKEN,
  DATABASE_URL
} = process.env

const privates = [
  TOKEN,
  DBL_TOKEN,
  DATABASE_URL
]

const symbolRegex = /(\.|\\|\?)/g
const evalRegex = new RegExp(`(${privates.reduce((a, e) => `${a}${a ? '|' : ''}${e.replace(symbolRegex, (match, capture) => '\\' + capture)}`, '')})`, 'g')

const data = {
  name: 'eval',
  desc: 'Run a piece of code',
  options: {
    args: [{ name: 'code' }],
    restricted: true
  },
  action: async ({ agent, client, commands, replacers, msg, args: [code], knex }) => {
    let result
    try {
      result = await eval(code) // eslint-disable-line
    } catch (err) {
      result = err
    }
    let output
    if (result instanceof Error || result instanceof Promise) output = String(result)
    else output = inspect(result)

    return {
      embed: {
        color: result instanceof Error ? 16711680 : 65280,
        footer: {
          text: 'Type: ' + (result instanceof Array ? 'array' : result instanceof Error ? 'error' : typeof result)
        },
        author: {
          name: 'JS Evaluation',
          icon_url: msg.author.avatarURL
        },
        fields: [
          {
            name: 'Input',
            value: `\`\`\`js\n${code}\`\`\``
          },
          {
            name: result instanceof Error ? 'Error' : 'Output',
            value: `\`\`\`js\n${output.replace(evalRegex, 'REDACTED')}\`\`\``
          }
        ]
      }
    }
  }
}

module.exports = new Command(data)

const { join } = require('path')

const {
  Command,
  Await
} = require('cyclone-engine')
const {
  prefixIcon,
  helpIcon
} = require('../utils.js').links

const data = {
  name: 'help',
  desc: 'Display this menu',
  options: {
    args: [{ name: 'page #' }]
  },
  action: function ({ client, commands, replacers, args: [num = 0] }) {
    const fields = ['']
    const pkg = require(join(process.cwd(), '/package.json'))
    for (const command of [...commands.values()]) {
      if (command.restricted) continue
      const content = command.info
      let index = fields.length - 1
      if ((fields[index] + content).length > 1024) {
        index++
        fields[index] = ''
      }
      fields[index] += (fields[index].length ? '\n' : '') + content
    }
    fields.push('**Replacers:**\n*Inserts live data values into commands. `|REPLACERNAME|` (IN requires a number)*\n\n' + [...replacers.values()].reduce((a, e) => `${a}**${e.key}** - *${e.description}*\n`, ''))
    const embed = {
      title: '*[Click for support]* Made by mets11rap',
      description: `${client.user.username} is a bot that can allow you to set up rooms that guilds can connect to and have chat across all connected guilds. Click [here](https://discordbots.org/bot/${client.user.id}) to add me to your server!\n\nOnce the bot has joined a room, simply type in the assigned channel to transmit your message. [Github](${pkg.repository.url.substring(4)})`,
      url: 'https://discord.gg/' + process.env.SUPPORT_SERVER,
      color: 33023,
      footer: {
        icon_url: prefixIcon,
        text: `Prefix: "${process.env.PREFIX}" or mention | <> = Mandatory () = Optional`
      },
      thumbnail: {
        url: client.user.dynamicAvatarURL('png')
      },
      author: {
        name: `${client.user.username} ${pkg.version} Help`,
        icon_url: helpIcon
      },
      fields: [
        {
          name: `Commands Page ${parseInt(num) || 1} out of ${fields.length}`,
          value: fields[parseInt(num) - 1] || fields[0]
        }
      ]
    }

    const wait = new Await({
      check: ({ msg, prefix }) => msg.content.startsWith(prefix + 'help'),
      time: 15000,
      options: {
        args: [{ name: 'page #' }]
      },
      action: ({ msg, args: [num], lastResponse }) => {
        embed.fields = [
          {
            name: `Commands Page ${parseInt(num) || 1} out of ${fields.length}`,
            value: fields[parseInt(num) - 1] || fields[0]
          }
        ]
        lastResponse.edit({ embed })
        return { wait }
      }
    })

    return {
      embed,
      wait
    }
  }
}

module.exports = new Command(data)

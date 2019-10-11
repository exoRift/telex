const {
  join
} = require('path')

const {
  SUPPORT_SERVER
} = process.env

const {
  Command,
  Await,
  ReactCommand,
  ReactInterface
} = require('cyclone-engine')

const {
  prefixIcon
} = require('../utils.js').links

const data = {
  name: 'help',
  desc: 'Display this menu',
  options: {
    args: [{ name: 'page #' }]
  },
  action: async ({ agent, client, msg, args: [page = 1] }) => {
    const pkg = require(join(process.cwd(), '/package.json'))

    const helpMenuData = {
      description: `${client.user.username} is a bot that can allow you to set up rooms that guilds can connect to and have chat across all connected guilds. Click [here](https://discordbots.org/bot/${client.user.id}) to add me to your server!\n\nOnce the bot has joined a room, simply type in the assigned channel to transmit your message. [Github](${pkg.repository.url.substring(4)})`,
      supportServerInviteCode: SUPPORT_SERVER,
      color: 33023,
      prefixImage: prefixIcon,
      version: pkg.version,
      page
    }
    const helpMenu = await agent.buildHelp(helpMenuData)

    const buttons = [
      new ReactCommand({
        emoji: '↩',
        action: async ({ msg }) => {
          helpMenuData.page -= 1
          const helpMenu = await agent.buildHelp(helpMenuData)

          msg.edit({ embed: helpMenu })
        }
      }),
      new ReactCommand({
        emoji: '↪',
        action: async ({ msg }) => {
          helpMenuData.page += 1
          const helpMenu = await agent.buildHelp(helpMenuData)

          msg.edit({ embed: helpMenu })
        }
      })
    ]

    const wait = new Await({
      time: 15000,
      options: {
        check: (msg) => msg.content.startsWith('help'),
        args: [{ name: 'page #' }],
        refreshOnUse: true,
        shiftCount: 1
      },
      action: async ({ msg, args: [page = 1], triggerResponse }) => {
        helpMenuData.page = page
        const helpMenu = await agent.buildHelp(helpMenuData)

        triggerResponse.edit({ embed: helpMenu })
      }
    })

    return {
      embed: helpMenu,
      options: {
        wait,
        reactInterface: new ReactInterface({
          buttons,
          options: {
            restricted: true,
            designatedUsers: msg.author.id,
            removeReaction: true
          }
        })
      }
    }
  }
}

module.exports = new Command(data)

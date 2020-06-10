const {
  join
} = require('path')

const {
  SUPPORT_SERVER,
  PREFIX
} = process.env

const {
  Command,
  Await,
  ReactCommand,
  ReactInterface
} = require('cyclone-engine')

const data = {
  name: 'help',
  desc: 'Display this menu',
  options: {
    args: [{ name: 'page #' }]
  },
  action: ({ agent, msg, args: [page] }) => {
    const pkg = require(join(process.cwd(), '/package.json'))

    const helpMenuData = {
      desc: `${agent.client.user.username} is a bot allows you to set up rooms that servers can connect to and chat across all connected servers. Click [here](https://discordbots.org/bot/${agent.client.user.id}) to add me to your server!\n\nOnce the bot has joined a room, simply type in the assigned channel to transmit your message. [Github](${pkg.repository.url.substring(4)})`,
      supportServerInviteCode: SUPPORT_SERVER,
      color: 33023,
      prefixImage: 'https://raw.githubusercontent.com/exoRift/telex/master/assets/Prefix.png',
      version: pkg.version
    }

    const {
      embed
    } = agent.buildHelp(helpMenuData, page)

    const buttons = [
      new ReactCommand({
        emoji: '↩',
        action: ({ msg }) => {
          page--
          embed.fields = agent.buildHelp(helpMenuData, page).embed.fields

          msg.edit({ embed })
        }
      }),
      new ReactCommand({
        emoji: '↪',
        action: ({ msg }) => {
          page++
          embed.fields = agent.buildHelp(helpMenuData, page).embed.fields

          msg.edit({ embed })
        }
      })
    ]

    const wait = new Await({
      time: 15000,
      options: {
        check: (msg) => msg.content.startsWith('help'),
        args: [{ name: 'page #' }],
        refreshOnUse: true,
        shiftCount: PREFIX.length
      },
      action: ({ msg, args: [page], triggerResponse }) => {
        embed.fields = agent.buildHelp(helpMenuData, page).embed.fields

        triggerResponse.edit({ embed })
      }
    })

    return {
      embed,
      options: {
        wait,
        reactInterface: new ReactInterface({
          buttons,
          options: {
            removeReaction: true
          }
        })
      }
    }
  }
}

module.exports = new Command(data)

const path = require('path')

const {
  SUPPORT_SERVER,
  PREFIX
} = process.env

const {
  Command,
  Await
} = require('cyclone-engine')

function pickMenu (agent, page = 1) {
  if (!isNaN(parseInt(page))) { // Help menu
    const pkg = require(path.join(process.cwd(), '/package.json'))

    const helpMenuData = {
      desc: `${agent.client.user.username} is a bot allows you to set up rooms that servers can connect to and chat across all connected servers. Click [here](https://discordbots.org/bot/${agent.client.user.id}) to add me to your server!\n\nOnce the bot has joined a room, simply type in the assigned channel to transmit your message. [Github](${pkg.repository.url.substring(4)})`,
      serverCode: SUPPORT_SERVER,
      color: 0x80FF,
      footerImage: 'https://raw.githubusercontent.com/exoRift/telex/master/assets/Prefix.png',
      version: pkg.version
    }

    const {
      embed,
      options: {
        reactInterface
      }
    } = agent.buildHelp(helpMenuData, page)
    if (reactInterface) reactInterface._options.deleteAfterUse = true

    const wait = new Await({
      time: 15000,
      options: {
        check: (msg) => msg.content.startsWith(PREFIX + 'help'),
        args: [{ name: 'page #' }],
        refreshOnUse: true,
        requirePrefix: true,
        shouldShift: true
      },
      action: ({ args: [page], triggerResponse }) => {
        const response = pickMenu(agent, page)

        triggerResponse.edit(response)
      }
    })

    return {
      embed,
      options: {
        awaits: wait,
        reactInterface
      }
    }
  } else { // Command guide
    const embed = agent.buildCommandGuide(page)

    return {
      embed
    }
  }
}

const data = {
  name: 'help',
  desc: 'Display this menu',
  options: {
    args: [{ name: 'page #' }]
  },
  action: ({ agent, args: [page] }) => {
    return pickMenu(agent, page)
  }
}

module.exports = new Command(data)

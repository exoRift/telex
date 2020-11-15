const {
  Command
} = require('cyclone-engine')

const jumpLinkRegex = /https:\/\/discord(?:app)?\.com\/channels\/(\d+)\/(\d+)\/(\d+)\/?/

const data = {
  name: 'quote',
  options: {
    args: [{ name: 'link', mand: true }],
    guide: {
      color: 0xB0FCFF,
      fields: [{
        name: 'Quoting an old message',
        value: 'Provide the link to a message to generate a quote for it'
      }]
    }
  },
  action: ({ agent, msg, args: [link] }) => {
    const match = link.match(jumpLinkRegex)

    if (match !== null) {
      const [
        full,
        guild,
        channel,
        message
      ] = match

      if (guild === msg.channel.guild.id) return agent.attachments.buildQuote(agent.client, channel, message, full)
    }
  }
}

module.exports = new Command(data)

const {
  ReactCommand,
  ReactInterface
} = require('cyclone-engine')

const {
  alerts
} = require('../../util/')

const data = {
  name: 'Leave',
  emoji: '🚪',
  action: async ({ agent, msg }) => {
    const [guildData] = await agent.attachments.db('guilds')
      .select(['room', 'adminrole'])
      .where('id', msg.channel.guild.id)

    const buttons = [
      new ReactCommand({
        emoji: '✅',
        action: () => agent.attachments.transmit(agent.client, agent.attachments.db, { room: guildData.room, msg: alerts.leave({ guildName: msg.channel.guild.name }) })
          .then(() => agent.attachments.db('guilds')
            .delete()
            .where('id', msg.channel.guild.id))
          .then(() => `Successfully left **${guildData.room}**`)
      }),
      new ReactCommand({
        emoji: ':RedTick:457860110056947712',
        action: async ({ msg }) => {
          await msg.delete()

          return 'Leave canceled'
        }
      })
    ]

    return {
      content: `Are you sure you want to leave **${guildData.room}**?`,
      options: {
        reactInterface: new ReactInterface({
          buttons,
          options: {
            deleteAfterUse: true,
            authLevel: 1
          }
        })
      }
    }
  }
}

module.exports = data

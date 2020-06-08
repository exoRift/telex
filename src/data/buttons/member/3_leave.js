const {
  ReactCommand,
  ReactInterface
} = require('cyclone-engine')

const {
  leave
} = require('../../utils/alerts/')

const data = {
  name: 'Leave',
  emoji: '🚪',
  action: ({ agent, msg }) => {
    return agent.attachments.db('guilds')
      .select(['room', 'adminrole'])
      .where('id', msg.channel.guild.id)
      .then(([{ room, adminrole }]) => {
        const buttons = [
          new ReactCommand({
            emoji: '✅',
            action: () => agent.attachments.transmit({ room, msg: leave({ guildName: msg.channel.guild.name }) })
              .then(() => agent.attachments.db('guilds')
                .delete()
                .where('id', msg.channel.guild.id))
              .then(() => `Successfully left **${room}**.`)
          }),
          new ReactCommand({
            emoji: ':RedTick:457860110056947712',
            action: ({ msg }) => {
              msg.delete()

              return '`Leave canceled.`'
            }
          })
        ]

        return {
          content: `Are you sure you want to leave **${room}**?`,
          options: {
            reactInterface: new ReactInterface({
              buttons,
              options: {
                deleteAfterUse: true,
                designatedUsers: adminrole
                  ? msg.channel.guild.members.reduce((accum, { id, roles }) => {
                    if (roles.find((r) => r === adminrole)) accum.push(id)
                    return accum
                  }, [msg.channel.guild.ownerID])
                  : msg.channel.guild.ownerID
              }
            })
          }
        }
      })
  }
}

module.exports = data

const {
  Await
} = require('cyclone-engine')

const {
  alerts
} = require('../../util/')

const data = {
  name: 'Name',
  value: ({ roomData }) => roomData.name,
  emoji: '📝',
  action: ({ msg }) => {
    return {
      content: 'Type a new name for your room (Cancels after 10 seconds): ',
      options: {
        awaits: new Await({
          options: {
            timeout: 10000,
            args: [{ name: 'name', mand: true }]
          },
          action: async ({ agent, msg: response, args: [name], triggerResponse }) => {
            await triggerResponse.delete().catch((ignore) => ignore)

            const [existing] = await agent.attachments.db('rooms')
              .select('name')
              .whereRaw('LOWER(name) = ?', name.toLowerCase())

            if (existing) return '`Room name taken`'

            const [roomData] = await agent.attachments.db('rooms')
              .select('name')
              .where('owner', msg.channel.guild.id)

            await agent.attachments.db('rooms')
              .update('name', name)
              .where('name', roomData.name)

            await agent.attachments.db('guilds')
              .update('room', name)
              .where('room', roomData.name)

            await agent.attachments.transmit(agent.client, agent.attachments.db, { room: name, msg: alerts.rename({ oldName: roomData.name, newName: name }) })

            await msg.edit(await agent.attachments.buildPanel(agent.client, agent.attachments.db, name, msg.channel.guild.id)).catch((ignore) => ignore)

            await response.delete().catch((ignore) => ignore)

            return `Successfully changed room name from **${roomData.name}** to **${name}**`
          }
        })
      }
    }
  }
}

module.exports = data

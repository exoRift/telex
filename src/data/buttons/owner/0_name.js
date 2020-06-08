const {
  Await
} = require('cyclone-engine')

const {
  rename
} = require('../../utils/alerts/')

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
          action: ({ agent, msg: response, args: [name], triggerResponse }) => {
            triggerResponse.delete().catch((ignore) => ignore)

            return agent.attachments.db('rooms')
              .select('name')
              .where(agent.attachments.db.raw('LOWER(name) = ?', name.toLowerCase()))
              .then(([existing]) => {
                if (existing) return '`Room name taken.`'
                else return agent.attachments.db('rooms')
                  .select('name')
                  .where('owner', msg.channel.guild.id)
                  .then(([room]) => agent.attachments.db('rooms')
                    .update('name', name)
                    .where('name', room.name)
                    .then(() => agent.attachments.db('guilds')
                      .update('room', name)
                      .where('room', room.name))
                    .then(async () => {
                      agent.attachments.transmit({ room: name, msg: rename({ oldName: room.name, newName: name }) })
    
                      msg.edit(await agent.attachments.buildPanel(name, msg.channel.guild.id)).catch((ignore) => ignore)
    
                      response.delete().catch((ignore) => ignore)
    
                      return `Successfully changed room name from \`${room.name}\` to \`${name}\``
                    }))
              })
          }
        })
      }
    }
  }
}

module.exports = data

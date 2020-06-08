const {
  Command
} = require('cyclone-engine')

const {
  abbreviate
} = require('../utils/')

const data = {
  name: 'room',
  desc: 'Open the room management panel',
  options: {
    guildOnly: true
  },
  action: ({ agent, msg }) => {
    return agent.attachments.db('guilds')
      .select('room')
      .where('id', msg.channel.guild.id)
      .then(async ([guildData]) => {
        if ((guildData && msg.member.roles.includes(guildData.adminrole)) || msg.author.id === msg.channel.guild.ownerID) {
          if (!guildData) {
            let name = `${msg.author.username}#${msg.author.discriminator}'s room`

            await agent.attachments.db('rooms')
              .select('name')
              .where('name', name)
              .then(async ([existing]) => {
                if (existing) name = Date.now()

                guildData = {
                  room: name
                }

                await agent.attachments.db('rooms')
                  .insert({
                    name,
                    pass: '1234',
                    owner: msg.channel.guild.id
                  })

                await agent.attachments.db('guilds')
                  .insert({
                    id: msg.channel.guild.id,
                    channel: agent.attachments.getValidChannel(msg.channel.guild, msg.channel).id,
                    room: name,
                    abbreviation: abbreviate(msg.channel.guild.name)
                  })

                await msg.channel.createMessage('Room created! By default, your password is `1234`.')
              })
          }

          return agent.attachments.buildPanel(guildData.room, msg.channel.guild.id)
        } else return '`You are unauthorized to do that`'
      })
  }
}

module.exports = new Command(data)

const {
  Command
} = require('cyclone-engine')

const data = {
  name: 'create',
  desc: 'Create a room you can manage and add other guilds to',
  options: {
    args: [{ name: 'name', mand: true, delim: '|' }, { name: 'pass' }],
    guildOnly: true,
    authLevel: 1,
    guide: {
      color: 65280,
      fields: [{
        name: 'Room Creation',
        value: 'Create a room\nUnless supplied to the command, the password is `1234` by default\nInvite other guilds with the `invite` command or give them the password and let them use the `join` command'
      }]
    }
  },
  action: async ({ agent, msg, args: [name, pass = '1234'] }) => {
    await msg.delete().catch((ignore) => ignore)

    const [guildData] = await agent.attachments.db('guilds')
      .select('room')
      .where('id', msg.channel.guild.id)

    if (guildData) return `\`You are already in the room: ${guildData.room}\``

    return agent.attachments.routines.createRoom(name, pass, msg.channel.guild.id)
      .then(() => 'Successfully created a room! Time to add some guilds to it')
      .catch(() => '`A room with that name already exists`')
  }
}

module.exports = new Command(data)

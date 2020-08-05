module.exports = ({ msg }) => {
  return {
    embed: {
      author: {
        name: msg.author.username,
        icon_url: msg.author.avatarURL,
        url: `https://discord.com/channels/${msg.channel.guilds.id}/${msg.channel.id}/${msg.id}`
      },
      title: 'Message is too long to pass through.',
      color: 16777010
    }
  }
}

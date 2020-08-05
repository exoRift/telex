module.exports = ({ guildName, content }) => {
  return {
    embed: {
      title: `Announcement from __${guildName}__`,
      description: content,
      color: 3381759
    }
  }
}

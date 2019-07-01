module.exports = ({ guildName, content }) => {
  return {
    title: `Announcement from __${guildName}__`,
    description: content,
    color: 3381759
  }
}

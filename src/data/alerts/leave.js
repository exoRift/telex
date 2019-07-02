module.exports = ({ guildName }) => {
  return {
    embed: {
      title: `__${guildName}__ has left the room.`,
      color: 16721950
    }
  }
}

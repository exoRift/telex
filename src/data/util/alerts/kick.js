module.exports = ({ guildName }) => {
  return {
    embed: {
      title: `__${guildName}__ was kicked from the room.`,
      color: 0xFF8000
    }
  }
}

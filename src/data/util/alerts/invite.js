module.exports = ({ guildName }) => {
  return {
    embed: {
      title: `__${guildName}__ was invited to the room.`,
      color: 0xFFFF66
    }
  }
}

module.exports = ({ guildName }) => {
  return {
    embed: {
      title: `__${guildName}__ was kicked from the room.`,
      color: 16744448
    }
  }
}

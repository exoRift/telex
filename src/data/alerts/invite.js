module.exports = ({ guildName }) => {
  return {
    embed: {
      title: `__${guildName}__ was invited to the room.`,
      color: 16777062
    }
  }
}

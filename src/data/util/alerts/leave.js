module.exports = ({ guildName }) => {
  return {
    embed: {
      title: `__${guildName}__ has left the room.`,
      color: 0xFF281E
    }
  }
}

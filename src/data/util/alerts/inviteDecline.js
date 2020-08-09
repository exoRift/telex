module.exports = ({ guildName }) => {
  return {
    embed: {
      title: `__${guildName}__ has declined the invite.`,
      color: 0xF54242
    }
  }
}

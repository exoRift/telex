module.exports = ({ guildName, guildsInRoom }) => {
  return {
    embed: {
      title: `__${guildName}__ has joined the room!`,
      description: guildsInRoom >= 3
        ? 'ATTENTION: The recommended number of guilds per room is 3. The more guilds you have, the slower messages will pass through due to ratelimiting.'
        : '',
      color: 0xFF00
    }
  }
}

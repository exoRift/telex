module.exports = ({ roomName }) => {
  return {
    embed: {
      title: `**${roomName}** has been deleted by the owner.`,
      color: 16711680
    }
  }
}

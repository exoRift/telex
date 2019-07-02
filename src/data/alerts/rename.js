module.exports = ({ oldName, newName }) => {
  return {
    embed: {
      title: `The room has been renamed from **${oldName}** to **${newName}**.`,
      color: 16777215
    }
  }
}

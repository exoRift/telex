const { Command } = require('cyclone-engine')

const { DBL_WIDGET } = process.env

const data = {
  name: 'dblwidget',
  desc: 'View a customized widget of the bot stats',
  action: () => {
    return {
      embed: {
        image: {
          url: DBL_WIDGET
        }
      }
    }
  }
}

module.exports = new Command(data)

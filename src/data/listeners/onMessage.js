const {
  routines
} = require('../util/')

/**
 * Run on a message reception
 * @async
 * @param {Eris.Client}    client The Eris Client
 * @param {Knex}           db     The Knex client
 * @param {Eris.Message}   msg    The message
 * @param {CommandResults} res    The results of the command handler
 */
async function onMessage (client, db, msg, res) {
  if (res && res.command) console.log(`[COMMAND] ${msg.timestamp} - **${msg.author.username}** > *${res.command.name || 'AWAIT'}*`)
  else if ((msg.content || msg.attachments.length) && !msg.type && await routines.isTransmissionChannel(db, msg.channel)) {
    return routines.compileMessage(db, msg)
      .then((response) => routines.transmit(client, db, response))
      .catch((err) => console.error('Transmission failed:\n' + err))
  }
}

module.exports = onMessage

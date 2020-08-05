/**
 * Run on a message reception
 * @async
 * @this  {Agent}              The agent
 * @param {Eris.Message}   msg The message
 * @param {CommandResults} res The results of the command handler
 */
async function onMessage (msg, res) {
  if (res && res.command) console.log(`${msg.timestamp} - **${msg.author.username}** > *${res.command.name || 'AWAIT'}*`)
  else if ((msg.content || msg.attachments.length) && !msg.type && await this.attachments.isTransmissionChannel(msg)) {
    return this.attachments.compileMessage(msg)
      .then(this.attachments.transmit)
      .catch((err) => this._handleError(err, msg))
  }
}

module.exports = onMessage

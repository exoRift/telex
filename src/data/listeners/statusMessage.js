const {
  PREFIX
} = process.env

/**
 * Cycle between statuses
 * @param {Function} editStatus The method to execute the status edit
 * @param {Agent}    agent      The agent
 */
function statusMessage (editStatus, agent) {
  let pos = 0

  const statuses = [
    () => {
      agent.attachments.db('rooms')
        .count()
        .then(([{ count }]) => editStatus({
          name: 'Room count: ' + count
        }))
    },
    () => editStatus({
      name: `Prefix: '${PREFIX}'`,
      type: 2
    })
  ]

  function cycleStatus (override) {
    statuses[pos](override !== undefined ? override : ++pos)
  }

  setInterval(cycleStatus, 300000)

  cycleStatus(0)
}

module.exports = statusMessage

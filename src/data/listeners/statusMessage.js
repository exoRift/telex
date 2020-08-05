const {
  PREFIX
} = process.env

/**
 * Cycle between statuses
 * @param {Function} editStatus The method to execute the status edit
 * @param {Agent}    agent      The agent
 */
function statusMessage (editStatus, agent) {
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

  let pos = 0

  function cycleStatus () {
    statuses[pos]()

    pos++
  }

  setInterval(cycleStatus, 300000)

  cycleStatus()
}

module.exports = statusMessage

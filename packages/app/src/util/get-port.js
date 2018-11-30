// TODO move this somewhere

import net from 'net'
import is from 'is-explicit'

/******************************************************************************/
// Helper
/******************************************************************************/

const isAvailable = options => new Promise((resolve, reject) => {

  const server = net.createServer()
  server.unref()

  server.once('error', () => resolve(false))
  server.listen(options, () => server.close(() => resolve(true)))

})

const getRandomPortNumber = () => {

  const MIN = 1023
  const MAX = 65535

  const { floor, random } = Math

  return MIN + floor(random() * floor(MAX - MIN))

}

const getPort = async ports => {

  if (!is.array(ports))
    ports = [ ports ]

  ports = ports.filter(is.number)

  const tried = []
  let port

  while (!is.number(port)) {

    let next
    do next = ports.length > 0
      ? ports.shift()
      : getRandomPortNumber()

    while (tried.includes(next))

    tried.push(next)

    if (await isAvailable(next))
      port = next

  }

  return port
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default getPort

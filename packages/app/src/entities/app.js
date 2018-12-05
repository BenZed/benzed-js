import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars

import is from 'is-explicit'
import { inspect } from 'util'

import { emitSequential, getPort } from '../util'
import { applyHooks } from './service'
import colors from 'colors/safe'

// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Helper
/******************************************************************************/

async function ensurePort () {

  const app = this

  // set default port
  if (app.get('port') === undefined)
    app.set('port', await getPort())

  const port = app.get('port')

  return port
}

const $$logtimestamp = Symbol('log-timestamp')

const time = () => {
  const date = new Date()
  return `` +
    `${date.getMonth() + 1}/${date.getDate()}-${date.getHours()}:` +
    `${date.getMinutes()}:${date.getSeconds()}`
}

function log (strings, ...params) {

  const app = this
  if (!app.get('logging'))
    return

  const arr = []
  for (let i = 0; i < strings.length; i++) {
    arr.push(strings[i])
    if (i < params.length)
      arr.push(
        typeof params[i] === 'string'
          ? params[i]
          : inspect(params[i])
      )
  }

  const now = time()

  console.log(
    now === this[$$logtimestamp]
      ? colors.gray(now)
      : now,
    arr.join('')
  )

  this[$$logtimestamp] = now
}

async function end () {

  const app = this

  if (app)
    await app::emitSequential('end')

  if (app?.listener) {
    await new Promise(resolve => app.listener.close(resolve))
    app.listener = null
  }

}

async function start () {

  const app = this

  if (!is.func(app.listen))
    throw new Error('cannot start app, no providers setup')

  await app::emitSequential('start')

  const port = await app::ensurePort()

  app.listener = app.listen(port)
  await new Promise(resolve => app.listener.once('listening', resolve))
  app.log`app listening on ${port}`

  await app::emitSequential('listen')

}

/******************************************************************************/
// Main
/******************************************************************************/

const addMiddleware = (app, middlewares, index = 0) => {

  for (let i = index; i < middlewares.length; i++) {

    const middleware = middlewares[i]
    const result = middleware(app)
    if (is(result, Promise))
      return result.then(resolved => {

        if (is.defined(resolved))
          app = resolved

        return addMiddleware(app, middlewares, i + 1)
      })

    if (is.defined(result))
      app = result
  }

  return app
}

/******************************************************************************/
// Validation
/******************************************************************************/

const validateAppProps = <object key='app' plain>

  <number key='port'
    cast
    range={[ 1024, 65535 ]}
  />

  <bool key='logging'
    cast
    default={process.env.NODE_ENV !== 'test'}
  />

  <array key='children' default={[]}>
    <func required />
  </array>

</object>

/******************************************************************************/
// Main
/******************************************************************************/

const app = props => {

  const {
    port,
    logging,
    children: middleware,
    ...config
  } = validateAppProps(props)

  return () => {

    const feathers = require('@feathersjs/feathers')

    const app = feathers()

    app.set('port', port)
    app.set('logging', logging)
    for (const key in config)
      app.set(key, config[key])

    app.log = log
    app.end = end
    app.start = start

    return addMiddleware(app, [ ...middleware, applyHooks ])
  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default app

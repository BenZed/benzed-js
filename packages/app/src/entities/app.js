import feathers from '@feathersjs/feathers'

import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars

import is from 'is-explicit'
import { inspect } from 'util'

import { emitSequential, getPort } from '../util'
import { applyHooks } from './service'

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

function log (strings, ...params) {

  const app = this

  if (!app.get('logging'))
    return

  let str = ''
  for (let i = 0; i < strings.length; i++) {
    str += strings[i]
    if (i < params.length)
      str += typeof params[i] === 'string'
        ? params[i]
        : inspect(params[i])
  }

  console.log(str)
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

const invalidPropsMessage = (g, b) => `recieved props it does not use: ${b}`

/******************************************************************************/
// Validation
/******************************************************************************/

const validateAppProps = <object
  key='app'
  plain
  strict={invalidPropsMessage}>

  <number key='port'
    cast
    range={[ 1024, 65535 ]}
  />

  <bool key='logging'
    cast
    default={process.env.NODE_ENV !== 'test'}
  />

  <arrayOf key='children' default={[]}>
    <func required />
  </arrayOf>

</object>

/******************************************************************************/
// Main
/******************************************************************************/

const app = props => {

  const { port, logging, children: middleware } = validateAppProps(props)

  return () => {

    const app = feathers()

    app.set('port', port)
    app.set('logging', logging)

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
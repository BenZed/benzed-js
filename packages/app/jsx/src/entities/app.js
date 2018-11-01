import feathers from '@feathersjs/feathers'

import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import { get, set } from '@benzed/immutable'

import is from 'is-explicit'

import { FEATHERS } from '../util'

// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Main
/******************************************************************************/

const addMiddleware = (app, middlewares, index = 0) => {

  for (let i = index; i < middlewares.length; i++) {

    const middleware = middlewares[i]
    const result = middleware(app[FEATHERS])
    if (is(result, Promise))
      return result.then(resolved => {

        if (is.defined(resolved))
          app[FEATHERS] = resolved

        return addMiddleware(app, middlewares, i + 1)
      })

    if (is.defined(result))
      app[FEATHERS] = result
  }

  return app
}

const invalidPropsMessage = (g, b) => `recieved props it does not use: ${b}`

/******************************************************************************/
//
/******************************************************************************/


class App {

  [FEATHERS] = feathers()

  get (path) {
    return get.mut(this[FEATHERS].settings, path)
  }

  set (path, value) {
    return set.mut(this[FEATHERS].settings, path, value)
  }

  async start () {

    const port = this.get('port')

    this.listener = this[FEATHERS].listen(port)

    await new Promise(resolve => this.listener.once('listening', resolve))

    return this.listener
  }

  async end () {
    if (this.listener) {
      await new Promise(resolve => this.listener.close(resolve))
      this.listener = null
    }
  }

}

/******************************************************************************/
//
/******************************************************************************/

const validateAppProps = <object key='app'
  plain
  strict={invalidPropsMessage}>

  <number key='port'
    cast
    range={[ 1024, 65535 ]}
    required
  />

  <arrayOf key='children' default={[]}>
    <func required />
  </arrayOf>

</object>

/******************************************************************************/
// Main
/******************************************************************************/

const app = props => {

  const { port, children: middleware } = validateAppProps(props)

  return () => {

    const app = new App()

    app.set('port', port)

    return addMiddleware(app, middleware)
  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default app

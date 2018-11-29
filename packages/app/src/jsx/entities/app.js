import feathers from '@feathersjs/feathers'

import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars

import is from 'is-explicit'

// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope */

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

    const app = feathers()

    app.set('port', port)

    return addMiddleware(app, middleware)
  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default app

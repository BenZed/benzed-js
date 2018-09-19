import React from 'react' // eslint-disable-line no-unused-vars
import { Link } from 'react-router-dom'

/******************************************************************************/
// Info
/******************************************************************************/

const INFO = {
  name: 'App'
}

/* eslint-disable react/prop-types */

/******************************************************************************/
// Doc
/******************************************************************************/

const App = ({ Types, Detail, Label }) =>
  <Types.Class info={INFO}>

    <p>
    The <Label brand='type'>App</Label> class is intended as a housing object for
    servers and api's built on top of <a href='http://feathersjs.com'>feathers.js</a>.
    </p>

    <p>
    Feathers applications can be created through configuration, rather than boiler plate code.
    </p>

    <p>
    Common functionality is contained within <Label brand='type'>Service</Label>{' '}
    and <Label brand='type'>Hook</Label> constructors. Esoteric functionality can
    be obtained by extending these classes.
    </p>

    <p>
    All in all, <Label brand='type'>App</Label> and it's associated classes are intended
    to speed up the already quick <a href='http://feathersjs.com'>feathers.js</a>
      {' '}workflow, combining common setups and use cases while circumventing common gotchas.
    </p>

    <h2>Configuration</h2>

    <p>Configuration is the ruler of an app. Configuration can either be
    a url to a config directory with env.json files, or it can be a plain javascript
    object:</p>

    <Detail.Script>{`
      import { App } from '@benzed/app'
      import path from 'path'

      const app1 = new App(path.join('./config'))

      // or

      const app2 = new App({
        services: {
          apples: true
        },
        rest: true,
        socketio: true,
        port: 5000
      })
    `}</Detail.Script>

    <p>An app will fail if configuration is not created properly.</p>

    <Detail.Configuration>
      <code>rest</code>
      <p>
        app configuration description goes here
      </p>
    </Detail.Configuration>

  </Types.Class>

/******************************************************************************/
// Exports
/******************************************************************************/

export { App }

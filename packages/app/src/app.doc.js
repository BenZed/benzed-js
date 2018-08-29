import React from 'react' // eslint-disable-line no-unused-vars

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

const App = ({ Types, Detail }) =>
  <Types.Class info={INFO}>

    <p>
    Defacto class for quickly creating backends out of configuration. It wraps
    a feathers app, take a configuration object that determines how complex it is.
    This will make it easier to test, and reduce the amount of testing required
    for projects that extend App.
    </p>

    <p>
    The App should be able to serve anything from static sites to complex web apps:
      <ul>
        <li>server-side rendering of a react ui</li>
        <li>socket.io provider</li>
        <li>rest provider</li>
        <li>user authentication</li>
        <li>file service</li>
        <li>real time editing service</li>
        <li>object log service</li>
        <li>task manager / process handler ? dunno what Im going to call it yet.</li>
        <li>version/paper trail service</li>
        <li>scalability ? no idea how</li>
      </ul>
    </p>
  </Types.Class>

/******************************************************************************/
// Exports
/******************************************************************************/

export { App }

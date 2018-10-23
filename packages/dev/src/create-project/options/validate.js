import { createValidator } from '@benzed/schema' // eslint-disable-line no-unused-vars

// @jsx createValidator
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Shortcuts
/******************************************************************************/

const mustBeEnabled = other =>
  (value, ctx) => {
    return value === true && !ctx.value[other]
      ? new Error(`requires ${other} to be enabled.`)
      : value
  }

/******************************************************************************/
// Main
/******************************************************************************/

const validateOptions = <object strict plain default={{}}>

  <string key='dir' required />
  <string key='name' required />

  <bool key='api' default={false} />
  <bool key='socketio' default={false} />

  <bool key='rest' default={false} validate={mustBeEnabled('api')} />
  <bool key='auth' default={false} validate={mustBeEnabled('api')} />

  <bool key='ui' default={false} />
  <bool key='routing' default={false} validate={mustBeEnabled('ui')} />

</object>

/******************************************************************************/
// Exports
/******************************************************************************/

export default validateOptions

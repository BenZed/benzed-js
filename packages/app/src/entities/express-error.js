
/******************************************************************************/
// Main
/******************************************************************************/

const expressError = props => {

  return app => {

    const express = require('@feathersjs/express')

    if (!app.rest)
      throw new Error('cant use express error handling without express enabled')

    app.use(express.errorHandler())

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default expressError


/******************************************************************************/
// Main
/******************************************************************************/

const expressError = ({ logger = false, html }) => {

  return app => {

    const express = require('@feathersjs/express')

    if (!app.rest)
      throw new Error('cannot use express error handling without express enabled')

    app.use(express.errorHandler({
      html,
      logger
    }))

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default expressError

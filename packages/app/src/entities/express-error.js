
/******************************************************************************/
// Main
/******************************************************************************/

const expressError = ({ logger = false, html }) => {

  return app => {

    const express = require('@feathersjs/express')

    if (!app.rest)
      throw new Error('cant use express error handling without express enabled')

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

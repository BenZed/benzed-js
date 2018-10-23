import TestApp from '../../test-app'
import { BadRequest } from '@feathersjs/errors'
import Component from './component'

/******************************************************************************/
// Main
/******************************************************************************/

class BasicWebpackedApp extends TestApp {

  getClientComponent (req, res) {
    return Component
  }

  onSerializeClient (req, res) {

    if (req.originalUrl === '/bad/route')
      throw new BadRequest('you cannot go to /bad/route')

    return req.originalUrl === '/foobar'
      ? { status: 'foobar' }
      : null
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default BasicWebpackedApp

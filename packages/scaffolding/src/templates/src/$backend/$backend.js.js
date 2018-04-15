
export default ({ has, iff, Backend, backend }) => has.api && `

import feathers from '@feathersjs/feathers'
${iff(has.rest || has.ui)`import express from '@feathersjs/express'`}
${iff(has.socketio)`import socketio from '@feathersjs/socketio'`}
${iff(has.auth)`import auth from '@feathersjs/authentication'
import local from '@feathers/authentication-local'
import jwt from '@feathers/authentication-jwt'`}

${iff(has.rest || has.ui)`import cors from 'cors'`}
${iff(has.rest)`import compress from 'compression'`}
${iff(has.ui)`import favicon from 'serve-favicon'`}
${iff(has.ui)`import path from 'path'`}
${iff(has.auth)`import { randomBytes } from 'crypto'`}

${iff(has.ui || has.auth)`/******************************************************************************/
// Data
/******************************************************************************/
`}${iff(has.ui)`
const PUBLIC_URL = path.resolve(__dirname, '../public')
const FAVICON_URL = path.resolve(__dirname, '../favicon.png')`}

${iff(has.auth)`
const { authenticate } = auth.hooks
const { protect } = local.hooks // TODO remove this`}

/******************************************************************************/
// Main
/******************************************************************************/

class ${Backend} {

  feathers = ${has.rest || has.ui ? 'express(feathers())' : 'feathers()'}
    ${iff(has.rest || has.ui)`.options('*', cors())
    .use(cors())`}
    ${iff(has.rest)`.use(compress())`}
    ${iff(has.rest || has.ui)`.use(express.json())
    .use(express.urlencoded({ extended: true }))`}
    ${iff(has.ui)`.use(favicon(FAVICON_URL))`}


  initialize () {

    const { feathers } = this

    ${iff(has.auth)`
    const opt = feathers.get('auth')
    const secret = (opt && opt.secret) || randomBytes(48).toString()`}

    feathers
      ${iff(has.socketio || has.rest)`// providers`}
      ${iff(has.socketio)`.configure(socketio())`}
      ${iff(has.rest)`.configure(express.rest())`}

      ${iff(has.auth)`// authentication configuration
      .configure(auth({ secret }))
      .configure(local())
      .configure(jwt())`}

    ${iff(has.auth)`// authentication hooks
    feathers
      .service('authenticate').hooks({
        before: {
          create: authenticate([ 'jwt', 'local' ]),
          remove: authenticate('jwt')
        }
      })`}

    ${iff(has.auth)`// setup database
    feathers::setupDatabase()`}

    ${iff(has.ui)`// serve public
    feathers
      .use('/', feathers.static(PUBLIC_URL))`}

  }

  start () {


  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ${Backend}`

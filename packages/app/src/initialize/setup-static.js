import express from '@feathersjs/express'
import cors from 'cors'
import compress from 'compression'

/******************************************************************************/
// Main
/******************************************************************************/

function setupStatic () {

  const app = this

  const { feathers } = app

  feathers
    .options('*', cors())
    .use(cors())
    .use(compress())

    .use(express.json())
    .use(express.urlencoded({ extended: true }))

  const ui = this.get('ui')
  if (ui && ui.favicon) {
    const favicon = require('serve-favicon')
    feathers
      .use(favicon(ui.favicon))
  }
  if (ui)
    feathers
      .use(express.static(ui.public))
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default setupStatic

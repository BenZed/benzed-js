import fs from 'fs-extra'
import path from 'path'
import is from 'is-explicit'

import feathers from '@feathersjs/feathers'
import express from '@feathersjs/express'

import cors from 'cors'
import compress from 'compression'

import { get, set } from '@benzed/immutable'

/******************************************************************************/
// Bens super duper backend class
/******************************************************************************/

// This is going to be my defacto class for creating backends out of modules I'm
// familiar. It will wrap a feathers app, take a configuration object that determines
// how complex it is. This will make it easier to test, and reduce the amount of
// testing required for projects that depend on this repo.

// The App should be able to serve anything from static sites to complex web apps:
// server-side rendering of a react ui
// user authentication
// socket.io provider
// rest provider
// file service
// real time editing service
// object log service
// task manager / process handler ? <-- dunno what I'm going to call it yet.
// version/paper trail service
// scalability <-- no idea how

// sensible handling of added services or rest/socket middleware

/******************************************************************************/
// Main
/******************************************************************************/

// The App class itself is an abstractish class that should be extended to
// add services/middleware

class App {

  constructor (configInput, mode = process.env.NODE_ENV || 'default') {

    this.mode = validateMode(mode)

    const config = validateConfig(configInput, this.mode)

    // create feathers app, apply config
    this.feathers = express(feathers())
    for (const key in config)
      this.set(key, config[key])

    this.feathers
      .options('*', cors())
      .use(cors())
      .use(compress())

      .use(express.json())
      .use(express.urlencoded({ extended: true }))

    const publicURL = this.get('public')
    if (publicURL) {
      validatePublic(publicURL)
      this.feathers
        .use(express.static(publicURL))
    }

    const faviconURL = this.get('favicon')
    if (faviconURL) {
      validateFavicon(faviconURL)
      const favicon = require('serve-favicon')
      this.feathers
        .use(favicon(faviconURL))
    }

  }

  get (path) {
    const { settings } = this.feathers
    return get.mut(settings, path)
  }

  set (path, value) {
    const { settings } = this.feathers
    return set.mut(settings, path, value)
  }

  start () {

  }

}

/******************************************************************************/
// Helper
/******************************************************************************/

function validateMode (mode) {

  if (!is(mode, String))
    throw new Error('mode, if supplied, must be a string')

  mode = mode.trim()

  if (mode.length === 0)
    throw new Error('mode must not be an empty string')

  return mode
}

function validateConfig (configInput, mode) {

  if (is.plainObject(configInput))
    return configInput

  if (!is(configInput, String))
    throw new Error('App must be instanced with a config object or a configUrl string.')

  if (!fs.existsSync(configInput))
    throw new Error(`configUrl does not point to an existing file system location: ${configInput}`)

  const stat = fs.statSync(configInput)
  if (!stat.isDirectory())
    throw new Error(`configUrl is not a directory: ${configInput}`)

  const defaultFiles = [ `${mode}.js`, `${mode}.json` ]
  if (!defaultFiles.map(name => path.join(configInput, name)).some(url => fs.existsSync(url)))
    throw new Error(`configUrl does not contain a ${mode}.js or ${mode}.json file: ${configInput}`)

  try {
    const configModuleUrl = path.join(configInput, mode)
    return require(configModuleUrl)

  } catch (err) {
    return null
  }

}

function validateFavicon (url) {
  if (is(url) && !is(url, String))
    throw new Error('favicon, if configured, must be a string')

  if (!fs.existsSync(url))
    throw new Error('favicon, if configured, must point toward an existing file')

  const ext = path.extname(url)
  if (!['.png', '.jpeg', '.jpg', '.svg', '.ico'].some(valid => valid === ext))
    throw new Error('favicon, if configured, must point toward a valid image file')
}

function validatePublic (url) {
  if (is(url) && !is(url, String))
    throw new Error('public, if configured, must be a string')

  if (!fs.existsSync(url))
    throw new Error('favicon, if configured, must point toward an existing file')

  const stat = fs.statSync(url)
  if (!stat.isDirectory())
    throw new Error('public, if configured, must point toward a folder')

  if (!fs.existsSync(path.join(url, 'index.html')))
    throw new Error(`public, if configured, must point toward a folder that contains an index.html`)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default App

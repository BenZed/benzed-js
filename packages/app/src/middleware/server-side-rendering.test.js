import { expect } from 'chai'
import serverSideRender from './server-side-rendering'
import setupProviders from '../initialize/setup-providers'
import path from 'path'
import fs from 'fs-extra'
import React from 'react'
import App from 'src/app'
import fetch from 'isomorphic-fetch'
import { Switch, Route } from 'react-router'
import { between } from '@benzed/string'

import 'colors'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/******************************************************************************/
// DATA
/******************************************************************************/

const TEMP_DIR = path.resolve(__dirname, '../../temp')

/******************************************************************************/
// Index Html
/******************************************************************************/

function testIndexHtml (id = 'test-project') {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset='UTF-8'>
  </head>
  <body>
    <main id='${id}'/>
  </body>
</html>
`
}

function createTestIndexHtml (id, subPath = '') {
  const url = path.join(TEMP_DIR + subPath, 'index.html')

  if (fs.existsSync(url))
    fs.removeSync(url)

  fs.ensureFileSync(url)
  fs.writeFileSync(url, testIndexHtml(id))

  return path.dirname(url)
}

/******************************************************************************/
// Fake Req / Res
/******************************************************************************/

function fakeCall (url) {
  const middleware = this

  const req = { url }
  const res = {
    body: [],
    head: [],
    ended: false,
    write (value) { this.body.push(value) },
    writeHead (...args) { this.head.push(args) },
    end () { this.ended = true }
  }

  middleware(req, res)

  return res
}

/******************************************************************************/
// Components
/******************************************************************************/

const Ssr = ({ ssr }) =>
  <h1>
    {ssr ? 'rendered server-side' : 'rendered client-side'}
  </h1>

const Page = ({ location }) =>
  <h2>{'@' + location.pathname}</h2>

const ExampleRoutesComponent = ({ ssr }) => [
  <Ssr key='rendered' ssr={ssr}/>,
  <Switch key='routes'>
    <Route exact path='/' component={Page}/>
    <Route exact path='/foo' component={Page}/>
    <Route exact path='/bar' component={Page}/>
  </Switch>
]

/******************************************************************************/
// Tests
/******************************************************************************/

describe.only('serverSideRender()', () => {

  it('is a function', () => {
    expect(serverSideRender).to.be.instanceof(Function)
  })

  it('writes a react component into an html template to reponse', () => {
    const id = 'example-project'
    const publicDir = createTestIndexHtml(id)
    const ssr = serverSideRender(publicDir, ExampleRoutesComponent)

    const res = ssr::fakeCall('/')

    expect(res.body).to.have.length(1)

    const html = res.body[0]

    expect(html).to.include(`<main id='${id}'>`)
    expect(html).to.include('</head>')
    expect(html).to.include('</html>')

    const SsrComponentOutput = html::between('<h1>', '</h1>')
    const PageComponentOutput = html::between('<h2>', '</h2>')

    expect(SsrComponentOutput).to.include('rendered server-side')
    expect(PageComponentOutput).to.equal('<h2>@/</h2>')
  })

  describe('public dir first arg', () => {
    it('throws if public dir does not have an index.html')
    it('throws if index.html doesn\'t have main tag')
    it('throws if main tag is missing id')
    it('throws if id is empty')
    it('throws if missing head tag')
  })

  describe('component second arg', () => {
    it('must be a function')
    it('expected to be a react component')
  })

  describe('in a basic app', () => {

    class BasicSsrTestApp extends App {
      constructor (override = {}) {
        super({ rest: true, port: 6789, ...override })
        this.initialize()
      }

      RoutesComponent = ExampleRoutesComponent

      initialize () {
        const dir = createTestIndexHtml('ssr-test-app', '/ssr-test-app')
        this::setupProviders()
        this.feathers.use(serverSideRender(dir, this.RoutesComponent))
      }
    }

    let app

    before(() => {
      app = new BasicSsrTestApp()
      return app.start()
    })

    after(() => {
      app && app.end()
    })

    describe('serves different routes given by RoutesComponent', () => {
      it('app starts', () => {
        expect(app.listener).to.not.equal(null)
      })

      for (const endpoint of [ '/', '/foo', '/bar' ])
        it(`correctly goes to endpoint ${endpoint}`, async () => {
          const address = `http://localhost:${app.get('port')}${endpoint}`
          const res = await fetch(address)
          const body = await res.text()

          const pageComponentOutput = body::between('<h2>', '</h2>')
          expect(pageComponentOutput).to.be.equal(`<h2>@${endpoint}</h2>`)
        })
    })
  })
})

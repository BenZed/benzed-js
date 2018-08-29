import { expect } from 'chai'
import serverSideRender from './server-side-rendering'
import setupProviders from '../initialize/setup-providers'

import React from 'react'
import fs from 'fs-extra'
import path from 'path'

import {
  createProjectAppAndTest,
  createProjectIndexHtml,
  createProjectFromPrefab,
  TestApp,
  TestBrowser
} from 'test-util/test-project'

import fetch from 'isomorphic-fetch'

import { Switch, Route } from 'react-router'
import { between } from '@benzed/string'

import 'colors'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/* eslint-disable react/prop-types, react/display-name */

/******************************************************************************/
// Tests
/******************************************************************************/

function expectBadlyFormedIndexHtml (doWithContents, doWithExpect) {
  const publicDir = createProjectIndexHtml('badly-formed')
  const index = path.join(publicDir, 'index.html')

  let contents = fs.readFileSync(index, 'utf-8')
  contents = doWithContents(contents)
  fs.writeFileSync(index, contents, 'utf-8')

  const test = expect(() => serverSideRender({
    publicDir,
    getComponent: () => {},
    serializer: () => {}
  })).to

  doWithExpect(test)

  fs.removeSync(path.dirname(publicDir))
}

describe('serverSideRender()', () => {

  it('is a function', () => {
    expect(serverSideRender).to.be.instanceof(Function)
  })

  describe('configuration', () => {
    describe('publicDir string', () => {
      it('must be a string', () => {
        expect(() => serverSideRender({
          publicDir: {}
        })).to.throw(`publicDir Must be of type: String`)
      })
      it('throws if public dir does not have an index.html', () => {
        expect(() => serverSideRender({
          publicDir: __dirname
        })).to.throw(`publicDir Missing index.html file: ${__dirname}`)
      })
      it('throws if index.html doesn\'t have main tag', () => {
        expectBadlyFormedIndexHtml(
          contents => contents.replace(/main/g, 'div'),
          to => to.throw(`main tag is not self closing or could not be found`)
        )
      })
      it('throws if main tag is missing id', () => {
        expectBadlyFormedIndexHtml(
          contents => contents.replace('id=\'badly-formed\'', ''),
          to => to.throw(`main tag does not have an id attribute`)
        )
      })
      it('throws if id is empty', () => {
        expectBadlyFormedIndexHtml(
          contents => contents.replace('id=\'badly-formed\'', 'id=\'\''),
          to => to.throw(`id is empty`)
        )
      })
      it('throws if missing head tag', () => {
        expectBadlyFormedIndexHtml(
          contents => contents.replace('</head>', ''),
          to => to.throw(`missing </head> tag`)
        )
      })
      it('is required', () => {
        expect(() => serverSideRender({})).to.throw('publicDir is Required.')
      })
    })

    describe('getComponent function', () => {
      it('must be a function', () => {
        const publicDir = createProjectIndexHtml('ssr-config-test')
        expect(() => serverSideRender({
          publicDir,
          getComponent: {}
        })).to.throw('getComponent Must be of type: Function')
      })
    })

    describe('serializer function', () => {
      it('must be a function', () => {
        const publicDir = createProjectIndexHtml('ssr-config-test')
        expect(() => serverSideRender({
          publicDir,
          getComponent: () => () => <h1>YO</h1>,
          serializer: {}
        })).to.throw('serializer Must be of type: Function')
      })
    })

    describe('getComponent and serializer', () => {

      let getComponent, serializer, publicDir
      before(() => {
        getComponent = () => () => <h1>I am I compoennt</h1>
        serializer = () => null
        publicDir = createProjectIndexHtml('ssr-config-test')
      })

      it('one or the other must be defined', () => {
        const msg = 'Either getComponent or serializer must be defined'
        expect(() => serverSideRender({ publicDir, getComponent }))
          .to.not.throw(msg)
        expect(() => serverSideRender({ publicDir, serializer }))
          .to.not.throw(msg)
        expect(() => serverSideRender({ publicDir }))
          .to.throw(msg)
      })

      it('if getComponent is defined, two middleware functions are returned', () => {
        let middleware = serverSideRender({ publicDir, getComponent })
        expect(middleware).to.have.length(2)

        middleware = serverSideRender({ publicDir, getComponent, serializer })
        expect(middleware).to.have.length(2)
      })

      it('if only serializer is defined, one middleware function is returned', () => {
        const middleware = serverSideRender({ publicDir, serializer })
        expect(middleware).to.have.length(1)
      })

    })
  })

  describe('in a basic app', () => {

    const Ssr = ({ hydrated }) =>
      <h1>
        { hydrated ? 'rendered server-side' : 'rendered client-side' }
      </h1>

    const Page = ({ location }) =>
      <h2>{'@' + location.pathname}</h2>

    const ExampleRoutesComponent = ({ hydrated }) => [
      <Ssr key='rendered' hydrated={hydrated}/>,
      <Switch key='routes'>
        <Route exact path='/' component={Page}/>
        <Route path='/foo' component={Page}/>
        <Route path='/bar' component={Page}/>
        <Route path='/bar/wise' component={Page}/>
      </Switch>
    ]

    class BasicSsrTestApp extends TestApp {

      getClientComponent () {
        return ExampleRoutesComponent
      }

      initialize () {
        this::setupProviders()
        const { public: _public } = this.get('rest')
        this.feathers.use(serverSideRender({
          publicDir: _public,
          getComponent: ::this.getClientComponent
        }))
      }
    }

    const name = 'basic-ssr-test-app'
    const basicConfig = {
      App: BasicSsrTestApp,
      name,
      rest: {
        public: createProjectIndexHtml(name)
      }
    }

    createProjectAppAndTest(basicConfig, state => {

      it('app starts', () => {
        expect(state.app.listener).to.not.equal(null)
      })

      for (const endpoint of [ '/', '/foo', '/bar', '/bar/wise' ])
        it(`correctly goes to endpoint ${endpoint}`, async () => {
          const res = await fetch(state.address + endpoint)
          const body = await res.text()

          const pageComponentOutput = body::between('<h2>', '</h2>')
          expect(pageComponentOutput).to.be.equal(`<h2>@${endpoint}</h2>`)
        })
    })
  })

  describe('in a webpacked app', () => {

    const { App } = createProjectFromPrefab('basic-webpacked-app')

    createProjectAppAndTest({ App }, state => {

      it('app starts', () => {
        expect(state.app.listener).to.not.equal(null)
      })

      it('serves component and style tags', async () => {
        const res = await fetch(state.address)
        const body = await res.text()

        const styleTags = body::between('<style data-styled-components', '</style>')
        expect(styleTags).to.not.be.equal(null)

        const mountedMain = body::between('<main', '</main')
        expect(mountedMain).to.not.be.equal(null)
        expect(mountedMain).to.include('serverside')
      })

      it('serves static assets as well', async () => {
        const res = await fetch(state.address + '/app.js.map')
        const body = await res.text()

        const publicDir = state.app.get(['rest', 'public'])

        const equivalentFile = path.join(publicDir, 'app.js.map')
        expect(body).to.be.equal(
          fs.readFileSync(equivalentFile, 'utf-8')
        )
      })

      it('client side code takes over without issue', async function () {

        this.timeout(5000)

        const browser = new TestBrowser(state.address)
        await browser.untilFetched()
        await browser.untilLoaded()

        const main = browser.document.getElementById('basic-webpacked-app')
        expect(main.innerHTML).to.include('clientside')
        expect(browser.fetched).to.include('serverside')
      })

      it('client side receives props serialized from server', async function () {

        this.timeout(5000)
        const browser = new TestBrowser(state.address + '/foobar')
        await browser.untilFetched()

        const serverStatusTag = browser.fetched::between('<h4 id="serialized-data', '</h4>')
        expect(serverStatusTag).to.include('foobar')

        await browser.untilLoaded()
        const clientStatusTag = browser.document.getElementById('serialized-data')
        expect(clientStatusTag).to.have.property('textContent', 'foobar')

      })

      it('client side receives server errors', async function () {
        this.timeout(5000)
        const browser = new TestBrowser(state.address + '/bad/route')
        await browser.untilFetched()

        const serverErrorTag = browser.fetched::between('<div id="server-error"', '</div>')
        expect(serverErrorTag).to.include('you cannot go to /bad/route')

        await browser.untilLoaded()
        const clientErrorTag = browser.document.getElementById('server-error')
        expect(clientErrorTag).to.have.property('innerHTML', '<h3>you cannot go to /bad/route</h3>')
      })

    })
  })

  describe('in a webpacked app without a react component getter', () => {

    const { App } = createProjectFromPrefab('basic-webpacked-app')

    class NoClientComponentReactApp extends App {
      getClientComponent = null
    }

    createProjectAppAndTest({ App: NoClientComponentReactApp }, state => {

      it('app starts', () => {
        expect(state.app.listener).to.not.equal(null)
      })

      it('serves index.html, which gets taken over by client', async () => {
        const browser = new TestBrowser(state.address + '/wherever')
        await browser.untilFetched()
        expect(browser.fetched).to.include('<main id=\'basic-webpacked-app\'></main>')

        await browser.untilLoaded()
        const main = browser.document.getElementById('basic-webpacked-app')
        expect(main.innerHTML).to.include('<h1>current page: /wherever</h1>')
      })

      it('retreives props serialized from server, which client then uses', async () => {
        const browser = new TestBrowser(state.address + '/foobar')
        await browser.untilFetched()
        expect(browser.fetched).to.include(`"status":"foobar"`)

        await browser.untilLoaded()
        const main = browser.document.getElementById('basic-webpacked-app')
        expect(main.innerHTML).to.include('<h4 id="serialized-data">foobar</h4>')
      })
    })
  })
})

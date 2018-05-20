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
  TestApp } from 'test-util/test-project'

import fetch from 'isomorphic-fetch'

import { Switch, Route } from 'react-router'
import { between } from '@benzed/string'

import 'colors'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/******************************************************************************/
// Tests
/******************************************************************************/

describe('serverSideRender()', () => {

  it('is a function', () => {
    expect(serverSideRender).to.be.instanceof(Function)
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

    const Ssr = ({ ssr }) =>
      <h1>
        { ssr ? 'rendered server-side' : 'rendered client-side' }
      </h1>

    const Page = ({ location }) =>
      <h2>{'@' + location.pathname}</h2>

    const ExampleRoutesComponent = ({ ssr }) => [
      <Ssr key='rendered' ssr={ssr}/>,
      <Switch key='routes'>
        <Route exact path='/' component={Page}/>
        <Route exact path='/foo' component={Page}/>
        <Route exact path='/bar' component={Page}/>
        <Route exact path='/bar/wise' component={Page}/>
      </Switch>
    ]

    class BasicSsrTestApp extends TestApp {

      RoutesComponent = ExampleRoutesComponent

      initialize () {
        this::setupProviders()
        const { public: _public } = this.get('rest')
        this.feathers.use(serverSideRender(_public, this.RoutesComponent))
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

      it('serves component', async () => {
        const res = await fetch(state.address + '/somewhere/else')
        const body = await res.text()

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
    })
  })
})

import { expect } from 'chai'
import WebpackConfig from './webpack-config'

import is from 'is-explicit'

import { inspect } from '../util'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('WebpackConfig', () => {

  it('is a class', () => {
    expect(WebpackConfig).to.throw('cannot be invoked without \'new\'')
  })

  describe('config', () => {

    describe('if provided, must be a plain object', () => {
      for (const badValue of [ null, 'string', false, 100, Symbol(''), [], new function () {}() ])
        it(inspect`${badValue} should throw`, () => {
          expect(() => new WebpackConfig(badValue)).to.throw('must be a plain object')
        })
    })

    describe('.entry', () => {

      describe('if not provided', () => {
        it('attempts to use ./src/webpack/index.js')
        it('attempts to use ./src/index.js')
        it('throws if no automatic alternative can be found')
      })

      describe(`if provided`, () => {
        it('must be a string')
        it('must point toward a .js file')
      })
    })

    describe('.output', () => {

      describe('if not provided', () => {
        it('attempts to use ./lib/public')
        it('attempts to use ./dist/public')
        it('attempts to use ./public')
        it('throws if no automatic alternative can be found')
      })

      describe('if provided', () => {
        it('must be a string')
        it('must point toward a folder with an index.html file')
      })

    })

    describe('.mode', () => {
      it('uses process.env.NODE_ENV if not provided')
      it('must be either \'production\' or \'development\' if provided')
    })

    describe('.html', () => {
      describe('if not provided', () => {
        it('attempts to use the a public/index.html relative to the resolved entry')
        it('attempts to use a public/index.html relative to the parent of the resolved entry')
        it('throws if cant be found')
      })
      describe('if provided', () => {
        it('must be a string')
        it('must point toward an html template')
      })
    })

  })

  describe('webpack config output', () => {

    let wc

    before(() => {
      try {
        wc = new WebpackConfig()
      } catch (err) {
        console.log(err)
      }
    })

    it('is a plain object', () => {
      expect(is.plainObject(wc))
    })
  })

  describe('webpacked output', () => {
    describe('creates an html from template', () => {
      it('links css')
      it('links bundles')
    })
  })

})

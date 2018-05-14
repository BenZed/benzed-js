import { expect } from 'chai'
import WebpackConfig from './webpack-config'

import is from 'is-explicit'
import fs from 'fs-extra'
import path from 'path'

import { inspect } from '../misc-util'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/******************************************************************************/
// Helper
/******************************************************************************/

const TEST_DIR = path.resolve(__dirname, '../../test/webpack-config')
const LIB_PUBLIC = path.resolve(TEST_DIR, 'lib/public')
const SRC_DIR = path.resolve(TEST_DIR, 'src')

const SRC_HTML = path.resolve(SRC_DIR, 'public/index.html')
const SRC_INDEX = path.resolve(SRC_DIR, 'index.js')

fs.ensureDirSync(LIB_PUBLIC)
fs.ensureFileSync(SRC_INDEX)
fs.ensureFileSync(SRC_HTML)

/******************************************************************************/
// Tests
/******************************************************************************/

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
      it('uses process.env.NODE_ENV || \'development\' if not provided', () => {
        const wc = new WebpackConfig({ cwd: TEST_DIR })

        const env = process.env.NODE_ENV || 'development'

        expect(wc.mode).to.equal(env)
      })
      it('must be either \'production\' or \'development\' if provided', () => {
        expect(() => new WebpackConfig({ cwd: TEST_DIR, mode: 'default' }))
          .to.throw('must either be production or development')
      })
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

    const agnosticEnvTests = wc => {
      it('is a plain object', () => {
        expect(is.plainObject(wc)).to.be.equal(true)
      })
      it('does not resolve .jsx files', () => {
        expect(wc.resolve.extensions).to.not.include('.jsx')
      })
      it('resolves src root', () => {
        const SRC = path.resolve(__dirname, '../src')
        expect(wc.resolve.modules.includes(SRC))
      })
    }

    describe('development', () => {
      const dev = new WebpackConfig({ cwd: TEST_DIR, mode: 'development' })

      it('has development mode', () => {
        expect(dev.mode).to.be.equal('development')
      })

      it('has mini css extract plugin', () => {
        const { plugins } = dev
        expect(plugins.filter(p => p.constructor.name === 'MiniCssExtractPlugin')).to.have.length(1)
      })

      it('has mini css extract plugin', () => {
        const { plugins } = dev
        expect(plugins.filter(p => p.constructor.name === 'HtmlWebpackPlugin')).to.have.length(1)
      })

      it('has node config for core/non-browser modules except url and punycode', () => {
        const { node } = dev

        const libs = require('repl')._builtinLibs.filter(l => l !== 'url' && l !== 'punycode')
        const keys = Object.keys(node)
        expect(keys).to.have.length(libs.length)
        expect(keys).to.deep.equal(libs)
      })

      agnosticEnvTests(dev)

    })

    describe('production', () => {
      const prod = new WebpackConfig({ cwd: TEST_DIR, mode: 'production' })

      it('has production mode', () => {
        expect(prod.mode).to.be.equal('production')
      })

      agnosticEnvTests(prod)

      it('has node config for core/non-browser modules ', () => {
        const { node } = prod

        const libs = require('repl')._builtinLibs
        const keys = Object.keys(node)
        expect(keys).to.have.length(libs.length)
        expect(keys).to.deep.equal(libs)
      })

      it('has define webpack plugin', () => {
        const { plugins } = prod
        expect(plugins.filter(p => p.constructor.name === 'DefinePlugin')).to.have.length(1)
      })
    })

  })

})

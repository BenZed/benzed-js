import { expect } from 'chai'
// import { inspect } from 'util'

import App from '../src'
import path from 'path'
import fs from 'fs-extra'
import is from 'is-explicit'

/******************************************************************************/
//
/******************************************************************************/
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

const CONFIG_URL = path.join(__dirname, 'config')

const CONFIG_OBJ = {
  'test-value': 'foobaz'
}

describe('App', () => {

  describe('construction', () => {

    const app = new App(CONFIG_URL)

    it('is a class', () => {
      expect(App).to.throw('cannot be invoked without \'new\'')
    })

    it('creates a feathers object', () => {
      const methods = ['get', 'set', 'service']

      expect(app.feathers).to.be.instanceof(Function)

      for (const method of methods)
        expect(app.feathers[method]).to.be.instanceof(Function)
    })

    it('has a mode property which matches the env.NODE_ENV variable', () => {
      expect(app).to.have.property('mode', process.env.NODE_ENV || 'default')
    })

  })

  describe('takes config argument', () => {

    it('must be a string or plain object', () => {
      const Foo = class { }
      const badValues = [ 1, false, null, undefined, new Date(), Symbol('cake'), new Foo() ]
      for (const badValue of badValues)
        expect(() => new App(badValue)).to.throw('object or a configUrl string')

      const goodValues = [ CONFIG_URL, {} ]
      for (const goodValue of goodValues)
        expect(() => new App(goodValue)).to.not.throw(Error)
    })

    describe('if string', () => {
      it('must be an existant path', () => {
        const fakeUrl = path.join(__dirname, 'not-a-real-place')
        expect(() => new App(fakeUrl)).to.throw('does not point to an existing file system location')
      })

      it('must be a directory', () => {
        const notDir = path.resolve(__dirname, '_before-any.test.js')
        expect(() => new App(notDir)).to.throw('is not a directory')
      })

      it('must contain a [mode].js or [mode].json file', () => {
        const emptyConfigUrl = path.resolve(__dirname, 'empty-config')
        fs.ensureDirSync(emptyConfigUrl)
        expect(() => new App(emptyConfigUrl)).to.throw('does not contain a default.js or default.json file')
        fs.removeSync(emptyConfigUrl)
      })

      it('applies properties from resulting config file when correct', () => {
        let app
        expect(() => { app = new App(CONFIG_URL) }).to.not.throw(Error)

        expect(app.feathers.get('test-value')).to.equal('foobar')
      })
    })

    describe('if object', () => {
      it('applies properties from object', () => {
        let app
        expect(() => { app = new App(CONFIG_OBJ) }).to.not.throw(Error)
        expect(app.feathers.get('test-value')).to.equal(CONFIG_OBJ['test-value'])
      })
    })

  })

  // TODO write these
  describe('optionally takes mode argument', () => {

    it('second argument overrides process.env.NODE_ENV', () => {
      const appDefault = new App(CONFIG_OBJ)
      const appOverride = new App(CONFIG_OBJ, 'test')
      expect(appDefault).to.have.property('mode', 'default')
      expect(appOverride).to.have.property('mode', 'test')
    })

    it('must be a string', () => {
      const badValues = [ {}, false, 1, -1, Infinity, NaN, function () {}, Symbol('-') ]
      for (const badValue of badValues)
        expect(() => new App(CONFIG_OBJ, badValue))
          .to
          .throw('mode, if supplied, must be a string')
    })

    it('must not be an empty string, when trimmed', () => {
      const badValues = [ '', ' ', '\n', '\t' ]
      for (const badValue of badValues)
        expect(() => new App(CONFIG_OBJ, badValue))
          .to
          .throw('mode must not be an empty string')
    })

    it('if combined with a configUrl string, must match the name of a config file', () => {
      expect(() => new App(CONFIG_URL, 'default')).to.not.throw(Error)
      expect(() => new App(CONFIG_URL, 'example')).to.not.throw(Error)
      expect(() => new App(CONFIG_URL, 'non-existant')).to.throw('does not contain a non-existant')
    })
  })

  describe('config.favicon', () => {
    it('does not need to be defined', () => {
      const fineValues = [ null, undefined, false, 0, '' ]
      for (const fineValue of fineValues)
        expect(() => new App({ ...CONFIG_OBJ, favicon: fineValue })).to.not.throw(Error)
    })

    it('must be a string', () => {
      const badValues = [ true, 100, {}, Buffer.from([0, 1, 2, 34, 5]) ]
      for (const badValue of badValues)
        expect(() => new App({ favicon: badValue })).to.throw(Error)
    })
    it('must point to an existing url', () => {
      const badValues = [
        './files/non-existant-icon.ico'
      ]
      for (const badValue of badValues)
        expect(() => new App({ ...CONFIG_OBJ, favicon: badValue })).to.throw('must point toward an existing file')
    })
    it('must not point toward a directory')
    it('must point to an image, png, jpeg, jpg, svg or ico')
  })

  describe('config.public', () => {
    it('must be a string')
    it('must point toward a public folder with an index.html file')
  })

})

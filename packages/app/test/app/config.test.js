import { expect } from 'chai'
import { set } from '@benzed/immutable'

import App from '../../src'
import path from 'path'
import fs from 'fs-extra'

/******************************************************************************/
//
/******************************************************************************/
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

const CONFIG_URL = path.resolve(__dirname, '../config')

const CONFIG_OBJ = {
  'test-value': 'foobaz',
  ui: {
    public: path.join(__dirname, '../public'),
    favicon: path.join(__dirname, '../public/favicon.ico')
  },
  port: 3000
}

describe('App', () => {

  describe('construction', () => {

    let app
    before(() => {
      try {
        app = new App(CONFIG_OBJ)
      } catch (err) {
        console.error(err)
      }
    })

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
        expect(() => new App(badValue)).to.throw('must be a plain object or url')

      const goodValues = [ CONFIG_URL, CONFIG_OBJ ]
      for (const goodValue of goodValues)
        expect(() => new App(goodValue)).to.not.throw(Error)
    })

    describe('if string', () => {
      it('must be an existant path', () => {
        const fakeUrl = path.join(__dirname, 'not-a-real-place')
        expect(() => new App(fakeUrl)).to.throw('configUrl does not exist')
      })

      it('must be a directory', () => {
        const notDir = path.resolve(__dirname, '../_before-any.test.js')
        expect(() => new App(notDir)).to.throw('is not a directory')
      })

      it('must contain a [mode].js or [mode].json file', () => {
        const emptyConfigUrl = path.resolve(__dirname, 'empty-config')
        fs.ensureDirSync(emptyConfigUrl)
        expect(() => new App(emptyConfigUrl)).to.throw('does not contain a valid default.js or default.json file')
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
          .throw('mode must be of type: String')

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
      expect(() => new App(CONFIG_URL, 'non-existant')).to.throw('does not contain a valid non-existant')
    })
  })

  describe('config.port', () => {
    it('is required', () => {
      expect(() => new App(CONFIG_OBJ::set('port', null))).to.throw('port is required')
    })
    it('must be a number', () => {
      expect(() => new App(CONFIG_OBJ::set('port', 'cake'))).to.throw('must be of type: Number')
    })
  })

  describe('config.ui', () => {
    it('not required', () => {
      const fineValues = [ null, undefined ]
      for (const fineValue of fineValues)
        expect(() => new App(CONFIG_OBJ::set('ui', fineValue))).to.not.throw(Error)
    })
    it('must be a plain object if defined', () => {
      const badValues = [ 1, false, true, Array ]
      for (const badValue of badValues)
        expect(() => new App(CONFIG_OBJ::set('ui', badValue))).to.throw('must be a plain object')
    })
    describe('config.ui.public', () => {
      it('must be a string', () => {
        const badValues = [ true, 100, {} ]
        for (const badValue of badValues)
          expect(() => new App(CONFIG_OBJ::set([ 'ui', 'public' ], badValue))).to.throw('must be of type: String')
      })
      it('must point toward a public folder with an index.html file', () => {
        const badValues = [
          path.resolve(__dirname, '../../test')
        ]
        for (const badValue of badValues)
          expect(() => new App(CONFIG_OBJ::set([ 'ui', 'public' ], badValue))).to.throw('must contain files \'index.html\'')
      })
      it('index.html must be formatted correctly')
    })
    describe('config.ui.favicon', () => {
      it('must be a string', () => {
        const badValues = [ true, 100, {} ]
        for (const badValue of badValues)
          expect(() => new App(CONFIG_OBJ::set([ 'ui', 'favicon' ], badValue))).to.throw('must be of type: String')
      })
      it('must point to an existing url', () => {
        const badValues = [
          '../files/non-existant-icon.ico'
        ]
        for (const badValue of badValues)
          expect(() => new App(CONFIG_OBJ::set([ 'ui', 'favicon' ], badValue))).to.throw('does not exist')
      })
      it('must point to an image: png, jpeg, jpg, svg or ico', () => {
        const badValues = [
          path.join(__dirname, '../config/default.json'),
          path.join(__dirname, '../config/example.json')
        ]
        for (const badValue of badValues)
          expect(() => new App(CONFIG_OBJ::set([ 'ui', 'favicon' ], badValue))).to.throw('be a file with extension .png,.jpeg,.jpg,.svg,.ico')
      })
    })
  })
})

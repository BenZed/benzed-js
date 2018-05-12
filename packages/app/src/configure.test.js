import { expect } from 'chai'

import App from './app'

import { get, set } from '@benzed/immutable'
import path from 'path'
import fs from 'fs-extra'
import { CONFIG_OBJ, CONFIG_URL } from 'test/util'
import { inspect } from '@benzed/dev'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('config app instance', () => {

  describe('argument', () => {

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
        expect(() => new App(fakeUrl)).to.throw('does not exist:')
      })

      it('must be a directory', () => {
        const notDir = path.resolve(__dirname, './app.js')
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

        expect(app.feathers.get('test-value')).to.equal(get(CONFIG_OBJ, 'test-value'))
      })
    })

    describe('if object', () => {
      it('applies properties from object', () => {
        let app
        expect(() => { app = new App(CONFIG_OBJ) }).to.not.throw(Error)
        expect(app.feathers.get('test-value')).to.equal(CONFIG_OBJ['test-value'])
      })
    })

    describe('optionally takes mode argument', () => {

      it('second argument overrides process.env.NODE_ENV', () => {
        const appDefault = new App(CONFIG_OBJ)
        const appOverride = new App(CONFIG_OBJ, 'test')
        expect(appDefault).to.have.property('mode', 'default')
        expect(appOverride).to.have.property('mode', 'test')
      })

      describe('must be a string', () => {
        const badValues = [ {}, NaN, Symbol('-') ]
        for (const badValue of badValues)
          it(`${String(badValue)}`, () => {
            expect(() => new App(CONFIG_OBJ, badValue))
              .to
              .throw('Must be of type: String')
          })
      })

      it('must not be an empty string, when trimmed', () => {
        const badValues = [ '', ' ', '\n', '\t' ]
        for (const badValue of badValues)
          expect(() => new App(CONFIG_OBJ, badValue))
            .to
            .throw('ust not be an empty string')
      })

      it('if combined with a configUrl string, must match the name of a config file', () => {
        expect(() => new App(CONFIG_URL, 'default')).to.not.throw(Error)
        expect(() => new App(CONFIG_URL, 'example')).to.not.throw(Error)
        expect(() => new App(CONFIG_URL, 'non-existant')).to.throw('does not contain a valid non-existant')
      })
    })

  })

  describe('config.port', () => {
    it('is required', () => {
      expect(() => new App(CONFIG_OBJ::set('port', null))).to.throw('port is Required')
    })
    it('must be a number', () => {
      expect(() => new App(CONFIG_OBJ::set('port', 'cake'))).to.throw('Must be of type: Number')
    })
  })

  describe('config.auth', () => {

    const withDB = CONFIG_OBJ::set('mongodb', {
      hosts: 'localhost:3200',
      database: 'test-db'
    })

    it('not required', () => {
      const fineValues = [ null, undefined ]
      for (const fineValue of fineValues)
        expect(() => new App(withDB::set('auth', fineValue))).to.not.throw(Error)
    })

    it('must be an object if defined', () => {
      const badValues = [ 10, Symbol('str'), 'str' ]
      for (const badValue of badValues)
        expect(() => new App(withDB::set('auth', badValue))).to.throw('Must be an Object')
    })

    it('booleans are cast to objects', () => {
      const castValues = [ true, false ]
      for (const castValue of castValues)
        expect(() => new App(withDB::set('auth', castValue))).to.not.throw(Error)
    })

    describe('config.auth.secret', () => {
      it('defaults to random string if not defined')
    })

    describe('config.auth.path', () => {
      it('defaults to \'/authentication\' if not defined')
    })

    describe('config.auth.entity', () => {
      it('defaults to \'user\' if not defined')
    })

    describe('config.auth.service', () => {
      it('defaults to \'users\' if not defined')
    })
  })

  describe('config.rest', () => {
    it('not required', () => {
      const fineValues = [ null, undefined ]
      const config = CONFIG_OBJ::set('socketio', true)

      for (const fineValue of fineValues)
        expect(() => new App(config::set('rest', fineValue))).to.not.throw(Error)
    })
    it('required if socket.io is disabled', () => {
      const fineValues = [ null, undefined ]
      for (const fineValue of fineValues)
        expect(() => new App(CONFIG_OBJ::set('rest', fineValue))).to.throw('rest required if socketio is disabled')
    })
    it('legal values are true, false, or an empty object')
    it('true is casted to an empty object')
    describe('config.rest.public', () => {
      it('must be a string', () => {

        const badValues = [ Symbol('-'), {} ]
        for (const badValue of badValues)
          expect(() => new App(CONFIG_OBJ::set([ 'rest', 'public' ], badValue))).to.throw('Must be of type: String')
      })
      it('must point toward a public folder with an index.html file', () => {
        const badValues = [
          path.resolve(__dirname, '../../dev')
        ]
        for (const badValue of badValues)
          expect(() => new App(CONFIG_OBJ::set([ 'rest', 'public' ], badValue))).to.throw('must contain files \'index.html\'')
      })
      it('index.html must be formatted correctly')
    })
    describe('config.rest.favicon', () => {
      it('must be a string', () => {
        const badValues = [ Symbol('-'), {} ]
        for (const badValue of badValues)
          expect(() => new App(CONFIG_OBJ::set([ 'rest', 'favicon' ], badValue))).to.throw('Must be of type: String')
      })
      it('must point to an existing url', () => {
        const badValues = [
          '../files/non-existant-icon.ico'
        ]
        for (const badValue of badValues)
          expect(() => new App(CONFIG_OBJ::set([ 'rest', 'favicon' ], badValue))).to.throw('does not exist')
      })
      it('must point to an image: png, jpeg, jpg, svg or ico', () => {
        const badValues = [
          path.join(__dirname, '../test/config/default.json'),
          path.join(__dirname, '../test/config/example.json')
        ]
        for (const badValue of badValues)
          expect(() => new App(CONFIG_OBJ::set([ 'rest', 'favicon' ], badValue))).to.throw('be a file with extension .png,.jpeg,.jpg,.svg,.ico')
      })
    })
    it('socket.io or rest must be defined')
  })

  describe('config.socketio', () => {
    it('optional')
    it('if defined, must be a bool or an object')
    it('socket.io or rest must be defined')
  })

  describe('config.services', () => {
    it('optional')
    it('if defined, must be a plain object')
    it('act as service options or initializers')
  })

  describe('config.mongodb', () => {

    describe('must be an object', () => {
      for (const badValue of [ true, false, [true], 'cake', Symbol('oy') ]) {
        const config = CONFIG_OBJ::set('mongodb', badValue)
        it(inspect`${badValue} should fail`, () => {
          expect(() => new App(config)).to.throw('mongodb Must be an Object')
        })
      }
    })

    it('is not required', () => {
      const config = CONFIG_OBJ::set('mongodb', null)
      expect(() => new App(config)).to.not.throw('mongodb Must be an Object')

    })
    it('required if auth is enabled', () => {

      const config = CONFIG_OBJ::set('auth', true)

      expect(() => new App(config)).to.throw('mongodb required if auth is enabled.')

    })

    const notStrings = [ {}, Symbol('oy') ]
    const withDB = CONFIG_OBJ::set('mongodb', {
      database: 'test-database',
      hosts: 'localhost:3200'
    })

    describe('config.mongodb.username', () => {
      describe('must be a string', () => {
        for (const badValue of notStrings)
          it(inspect`${badValue} should fail`, () => {
            const config = withDB::set(['mongodb', 'username'], badValue)
            expect(() => new App(config)).to.throw('username Must be of type: String')
          })
      })
    })

    describe('config.mongodb.password', () => {
      describe('must be a string', () => {
        for (const badValue of notStrings)
          it(inspect`${badValue} should fail`, () => {
            const config = withDB::set(['mongodb', 'password'], badValue)
            expect(() => new App(config)).to.throw('password Must be of type: String')
          })
      })
    })

    describe('config.mongodb.database', () => {
      describe('must be a string', () => {
        for (const badValue of notStrings)
          it(inspect`${badValue} should fail`, () => {
            const config = CONFIG_OBJ::set(['mongodb', 'database'], badValue)
            expect(() => new App(config)).to.throw('database Must be of type: String')
          })
      })
    })

    describe('config.mongodb.localdata', () => {
      it('is a string')
      it('is optional')
      it('must point toward an existing local folder')
    })

    describe('config.mongodb.hosts', () => {

      it('must be an array of strings', () => {
        const config = withDB::set(['mongodb', 'hosts'], [{}, {}, {}])
        expect(() => new App(config)).to.throw('hosts Must be an Array of String')
      })

      describe('each string must be a url formatted', () => {

        for (const badValue of ['name@email.com', 'CONST_THING', 'ahh mazing', 'foo[bar]']) {
          const bad = withDB::set(['mongodb', 'hosts'], badValue)
          it(`'${badValue}' should throw`, () => {
            expect(() => new App(bad)).to.throw('hosts Must be a url.')
          })
        }

        for (const goodValue of ['localhost:3200', '192.168.1.102:27107', 'gears.server.quake:4500']) {
          const good = withDB::set(['mongodb', 'hosts'], goodValue)
          it(`'${goodValue}' should not throw`, () => {
            expect(() => new App(good)).to.not.throw('Must be a url.')
          })
        }

      })
    })
  })

  describe('config.services', () => {

    it('must be an object')
    it('key names match service names')

    describe('config.services[name]', () => {
      it('must be an object')
      it('bool casts to object')
    })
  })

  describe('config.logging', () => {
    it('must be a bool')
    it('defaults to true')
  })

})

describe('config app class extension', () => {

  describe('ExtendedApp.socketio', () => {
    it('optional')
    it('if defined, must be a function')
    it('acts as socket.io middleware')
  })

  describe('ExtendedApp.rest', () => {
    it('optional')
    it('if defined, must be a function')
    it('acts as rest middleware')
  })

  describe('ExtendedApp.services', () => {
    it('optional')
    it('if defined must be a function or service instance or array of functions or service instances')
    it('are expected to add new services')
    it('must have accompanying configurations in config.services')
  })

})

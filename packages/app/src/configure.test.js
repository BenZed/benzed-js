import { expect } from 'chai'

import { get, set } from '@benzed/immutable'
import path from 'path'
import fs from 'fs-extra'
import { inspect } from '@benzed/dev'

import { createProjectConfigJson, TestApp } from 'test-util'

/******************************************************************************/
// DATA
/******************************************************************************/

const CONFIG_OBJ = {
  socketio: true,
  port: 6281
}

const CONFIG_URL = createProjectConfigJson(CONFIG_OBJ, 'config-test', 'default')
createProjectConfigJson(CONFIG_OBJ, 'config-test', 'example')

const configAuthDataDir = path.resolve(__dirname, '../temp/confg-auth-data')
fs.ensureDirSync(configAuthDataDir)

/******************************************************************************/
// Shortcut
/******************************************************************************/

function expectNewTestApp (config, mode) {
  return expect(() => new TestApp(config, mode))
}

/******************************************************************************/
// Tests
/******************************************************************************/

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('config app instance', () => {

  describe('argument', () => {

    it('must be a string or plain object', () => {

      const badValues = [ null, undefined, 1, false, Symbol('cake') ]
      for (const badValue of badValues)
        expectNewTestApp(badValue).to.throw('must be a url or plain object')

      const goodValues = [ CONFIG_URL, CONFIG_OBJ ]
      for (const goodValue of goodValues)
        expectNewTestApp(goodValue).to.not.throw(Error)

    })

    describe('if string', () => {
      it('must be an existant path', () => {
        const fakeUrl = path.join(__dirname, 'not-a-real-place')
        expectNewTestApp(fakeUrl).to.throw('does not exist:')
      })

      it('must be a directory', () => {
        const notDir = path.resolve(__dirname, './app.js')
        expectNewTestApp(notDir).to.throw('is not a directory')
      })

      it('must contain a [mode].js or [mode].json file', () => {
        const emptyConfigUrl = path.resolve(__dirname, 'empty-config')
        fs.ensureDirSync(emptyConfigUrl)
        expectNewTestApp(emptyConfigUrl).to.throw('does not contain a valid default.js or default.json file')
        fs.removeSync(emptyConfigUrl)
      })

      it('applies properties from resulting config file when correct', () => {
        let app
        expect(() => { app = new TestApp(CONFIG_URL) }).to.not.throw(Error)

        expect(app.feathers.get('test-value')).to.equal(get(CONFIG_OBJ, 'test-value'))
      })
    })

    describe('if object', () => {
      it('applies properties from object', () => {
        let app
        expect(() => { app = new TestApp(CONFIG_OBJ) }).to.not.throw(Error)
        expect(app.feathers.get('test-value')).to.equal(CONFIG_OBJ['test-value'])
      })
    })

    describe('optionally takes mode argument', () => {

      it('second argument overrides process.env.NODE_ENV', () => {
        const appDefault = new TestApp(CONFIG_OBJ)
        const appOverride = new TestApp(CONFIG_OBJ, 'test')
        expect(appDefault).to.have.property('mode', 'default')
        expect(appOverride).to.have.property('mode', 'test')
      })

      describe('must be a string', () => {
        const badValues = [ {}, NaN, Symbol('-') ]
        for (const badValue of badValues)
          it(`${String(badValue)}`, () => {
            expectNewTestApp(CONFIG_OBJ, badValue)
              .to
              .throw('mode must be of type: String')
          })
      })

      it('must not be an empty string, when trimmed', () => {
        const badValues = [ '', ' ', '\n', '\t' ]
        for (const badValue of badValues)
          expectNewTestApp(CONFIG_OBJ, badValue)
            .to
            .throw('mode must not be an empty string')
      })

      it('if combined with a configUrl string, must match the name of a config file', () => {
        expectNewTestApp(CONFIG_URL, 'default').to.not.throw(Error)
        expectNewTestApp(CONFIG_URL, 'example').to.not.throw(Error)
        expectNewTestApp(CONFIG_URL, 'non-existant').to.throw('does not contain a valid non-existant')
      })
    })

  })

  describe('config.port', () => {
    it('is required', () => {
      expectNewTestApp(CONFIG_OBJ::set('port', null)).to.throw('config.port is required')
    })
    it('must be a number', () => {
      expectNewTestApp(CONFIG_OBJ::set('port', 'cake')).to.throw('config.port must be of type: Number')
    })
  })

  describe('config.auth', () => {

    const withDB = CONFIG_OBJ::set('mongodb', {
      hosts: 'localhost:3200',
      database: 'test-db',
      dbpath: configAuthDataDir
    })

    it('not required', () => {
      const fineValues = [ null, undefined ]
      for (const fineValue of fineValues)
        expectNewTestApp(withDB::set('auth', fineValue)).to.not.throw(Error)
    })

    it('must be an object if defined', () => {
      const badValues = [ 10, Symbol('str'), 'str' ]
      for (const badValue of badValues)
        expectNewTestApp(withDB::set('auth', badValue)).to.throw('config.auth must be a plain object')
    })

    it('booleans are cast to objects', () => {
      const castValues = [ true, false ]
      for (const castValue of castValues)
        expectNewTestApp(withDB::set('auth', castValue)).to.not.throw(Error)
    })

    let withAuth, authOutput
    before(() => {
      withAuth = withDB::set('auth', true)
      authOutput = new TestApp(withAuth).feathers.settings.auth
    })

    describe('config.auth.secret', () => {
      it('defaults to random string if not defined', () => {
        expect(authOutput).to.have.property('secret')
        expect(typeof authOutput.secret).to.equal('string')
      })
    })

    describe('config.auth.path', () => {
      it('defaults to \'/authentication\' if not defined', () => {
        expect(authOutput).to.have.property('path', '/authentication')
      })
    })

    describe('config.auth.entity', () => {
      it('defaults to \'user\' if not defined', () => {
        expect(authOutput).to.have.property('entity', 'user')
      })
    })

    describe('config.auth.service', () => {
      it('defaults to \'users\' if not defined', () => {
        expect(authOutput).to.have.property('service', 'users')
      })
    })
  })

  describe('config.rest', () => {
    it('not required', () => {
      const fineValues = [ null, undefined ]
      const config = CONFIG_OBJ::set('socketio', true)

      for (const fineValue of fineValues)
        expectNewTestApp(config::set('rest', fineValue)).to.not.throw(Error)
    })
    it('required if socket.io is disabled', () => {
      const fineValues = [ null, undefined ]
      const config = CONFIG_OBJ::set('socketio', false)
      for (const fineValue of fineValues)
        expectNewTestApp(config::set('rest', fineValue)).to.throw('rest required if socketio is disabled')
    })

    it('true is casted to an empty object', () => {
      const app = new TestApp(CONFIG_OBJ::set('rest', true))

      expect(app.feathers.settings.rest).to.be.deep.equal({})
    })

    describe('config.rest.public', () => {
      it('must be a string', () => {

        const badValues = [ Symbol('-'), {} ]
        for (const badValue of badValues)
          expectNewTestApp(CONFIG_OBJ::set([ 'rest', 'public' ], badValue))
            .to
            .throw('config.rest.public must be of type: String')
      })
      it('must point toward a public folder with an index.html file', () => {
        const badValues = [
          path.resolve(__dirname, '../../dev')
        ]
        for (const badValue of badValues)
          expectNewTestApp(CONFIG_OBJ::set([ 'rest', 'public' ], badValue)).to.throw('must contain files \'index.html\'')
      })
    })

    it('socket.io or rest must be defined', () => {
      const noProvider = CONFIG_OBJ::set('socketio', false)
      expectNewTestApp(noProvider).to.throw('rest required if socketio is disabled')
    })
  })

  describe('config.socketio', () => {
    it('optional', () => {
      const restOnly = CONFIG_OBJ::set('rest', true)::set('socketio', false)
      expectNewTestApp(restOnly).to.not.throw(Error)
    })
    it('if defined, must be a bool or an object', () => {

      for (const badValue of ['socketio', [], Symbol('not')])
        expectNewTestApp(CONFIG_OBJ::set('rest', true)::set('socketio', badValue))
          .to.throw('config.socketio must be a plain object')

    })
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
          expectNewTestApp(config).to.throw('mongodb must be a plain object')
        })
      }
    })

    it('is not required', () => {
      const config = CONFIG_OBJ::set('mongodb', null)
      expectNewTestApp(config).to.not.throw('mongodb must be a plain object')
    })
    it('required if auth is enabled', () => {

      const config = CONFIG_OBJ::set('auth', true)

      expectNewTestApp(config).to.throw('mongodb required if auth is enabled.')

    })

    const notStrings = [ {}, Symbol('oy') ]
    const withDB = CONFIG_OBJ::set('mongodb', {
      database: 'test-database',
      hosts: 'localhost:3200',
      dbpath: configAuthDataDir
    })

    describe('config.mongodb.username', () => {
      describe('must be a string', () => {
        for (const badValue of notStrings)
          it(inspect`${badValue} should fail`, () => {
            const config = withDB::set(['mongodb', 'username'], badValue)
            expectNewTestApp(config).to.throw('username must be of type: String')
          })
      })
    })

    describe('config.mongodb.password', () => {
      describe('must be a string', () => {
        for (const badValue of notStrings)
          it(inspect`${badValue} should fail`, () => {
            const config = withDB::set(['mongodb', 'password'], badValue)
            expectNewTestApp(config).to.throw('password must be of type: String')
          })
      })
    })

    describe('config.mongodb.database', () => {
      describe('must be a string', () => {
        for (const badValue of notStrings)
          it(inspect`${badValue} should fail`, () => {
            const config = CONFIG_OBJ::set(['mongodb', 'database'], badValue)
            expectNewTestApp(config).to.throw('database must be of type: String')
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
        expectNewTestApp(config).to.throw('hosts[0] must be of type: String')
      })

      describe('each string must be a url formatted', () => {

        for (const badValue of ['name@email.com', 'CONST_thing', 'ahh mazing', 'foo[bar]']) {
          const bad = withDB::set(['mongodb', 'hosts'], badValue)
          it(`'${badValue}' should throw`, () => {
            expectNewTestApp(bad).to.throw('hosts[0] must be a url.')
          })
        }

        for (const goodValue of ['localhost:3200', '192.168.1.102:27107', 'gears.server.quake:4500']) {
          const good = withDB::set(['mongodb', 'hosts'], goodValue)
          it(`'${goodValue}' should not throw`, () => {
            expectNewTestApp(good).to.not.throw('must be a url.')
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
    it('must be a bool', () => {
      for (const badValue of [ [], {}, 'heyhey', 1000, Symbol('quake') ])
        expectNewTestApp(CONFIG_OBJ::set('logging', badValue))
          .to.throw('logging must be of type: Boolean')
    })
    it('defaults to true', () => {
      const app = new TestApp(CONFIG_OBJ)
      expect(app.feathers.settings.logging).to.be.equal(true)
    })
  })

})

describe('config autocompletes', () => {
  it('relative paths convert to absolute paths', () => {

    const upOne = '../to/some/dir'
    const acrossOne = './to/some/dir'
    const absolute = '/should/stay/absolue'

    const withPath = CONFIG_OBJ::set(
      'up-one', upOne
    )::set(
      'across-one', acrossOne
    )::set(
      'absolute', absolute
    )

    const cwd = process.cwd()

    const app = new TestApp(withPath)
    const { settings } = app.feathers

    expect(settings).to.have.property('up-one', path.resolve(cwd, upOne))

    expect(settings).to.have.property('across-one', path.resolve(cwd, acrossOne))

    expect(settings).to.have.property('absolute', absolute)

  })
  it('UPPER_SNAKE_CASE values read from process.env', () => {

    const key = 'some-hidden-variable'
    const value = 'SECRET_KEY_THING'
    const withSecret = CONFIG_OBJ::set(
      key, value
    )

    const ONE_MILLION = '1000000'
    process.env[value] = ONE_MILLION

    const app = new TestApp(withSecret)
    const { settings } = app.feathers

    expect(settings).to.have.property(key)
    expect(settings[key]).to.be.equal(ONE_MILLION)

  })
})

describe('config app class extension', () => {

  describe('ExtendedTestApp.socketio', () => {
    it('optional')
    it('if defined, must be a function')
    it('acts as socket.io middleware')
  })

  describe('ExtendedTestApp.rest', () => {
    it('optional')
    it('if defined, must be a function')
    it('acts as rest middleware')
  })

  describe('ExtendedTestApp.services', () => {
    it('optional')
    it('if defined must be a function or service instance or array of functions or service instances')
    it('are expected to add new services')
    it('must have accompanying configurations in config.services')
  })

})

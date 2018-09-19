import { expect } from 'chai'
import Service from './service'

import App from '../../app'
// import { CONFIG_OBJ } from 'test/util'
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('Service', () => {

  it('is a class', () => {
    expect(Service).to.throw('invoked without \'new\'')
  })

  describe('usage', () => {

    describe('takes a config object, name and App instance', () => {
      it('throws if config is not an object', () => {
        expect(() => new Service('oy')).to.throw('Must be an Object')
      })
      it('throws if name is not a string', () => {
        expect(() => new Service({}, null))
          .to.not
          .throw('Must be of type: String')

        expect(() => new Service({}, {}))
          .to
          .throw('Must be of type: String')
      })
      it('throws if app is not an app instance', () => {
        expect(() => new Service({}, 'comments'))
          .to.throw('Must be an App instance.')
        expect(() => new Service({}, 'comments', {}))
          .to.throw('Must be an App instance.')
      })
    })

    function noop () {}

    let app, middlewareRegistered, initializeCalled
    before(async () => {

      class HackService extends Service {

        addMiddleware () {
          middlewareRegistered = true
          return []
        }

        initialize () {
          initializeCalled = true
        }

        hooks () {
          return {
            before: {
              all: noop
            }
          }
        }
      }

      try {

        class HackApp extends App {
          services = {
            articles: HackService
          }
        }

        app = new HackApp({
          port: 4516,
          socketio: true,
          logging: false,
          services: {
            articles: true
          },
          mongodb: {
            database: 'test-db',
            hosts: 'localhost:4616'
          }
        })

        await app.initialize()

      } catch (err) {
        console.error(err)
      }
    })

    after(async () => {
      await app.end()
    })

    it('adds a service shortcut to App instance', () => {
      expect(app.articles).to.not.equal(undefined)
    })

    it('runs getDatabaseAdapter', () => {
      expect(app.articles.Model.s.name).to.be.equal('articles')
    })

    it('runs registerToFeathers', () => {
      expect(middlewareRegistered).to.equal(true)
    })

    it('runs compileHooks', () => {
      expect(app.feathers._hooks).to.not.be.equal(null)
    })

    it('returns a feathers service object')

    it('runs setupVersions if configured')

    it('runs setupLiveEdit if configured')

    it('runs initialize() if defined', () => {
      expect(initializeCalled).to.be.equal(true)
    })

    it('runs setupSocketMiddleware() if defined')

    it('runs start() if defined')

  })

  describe('methods', () => {

    describe('before, after, error hook shortcuts', () => {
      it('before')
      it('after')
      it('error')
    })

  })

  describe('configuration', () => {
    it('config.path')
    it('config.versions')
    it('config.liveEdit')
    it('config.paginate')
  })

})

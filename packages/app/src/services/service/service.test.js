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

    let app, articles, preWareRan
    before(async () => {

      class HackService extends Service {

        preRegisterWare () {
          preWareRan = true
          return []
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
        app = new App({
          port: 4313,
          socketio: true,
          logging: false,
          mongodb: {
            database: 'test-db',
            hosts: 'localhost:4314'
          }
        })

        await app.initialize()

        articles = new HackService({ }, 'articles', app)
      } catch (err) {
        console.log(err.message, err.path)
      }
    })

    after(async () => {
      await app.end()
    })

    it('adds a service shortcut to App instance', () => {
      expect(app.articles).to.be.equal(articles)
    })

    it('runs getDatabaseAdapter', () => {
      expect(app.articles.Model.s.name).to.be.equal('articles')
    })

    it('runs registerToFeathers', () => {
      expect(preWareRan).to.equal(true)
    })

    it('runs compileHooks', () => {
      // console.log(app.feathers._hooks)
      expect(app.feathers._hooks)
    })

    it('returns a feathers service object')

    it('runs setupVersions if configured')

    it('runs setupLiveEdit if configured')

  })

  describe('configuration', () => {
    it('config.path')
    it('config.versions')
    it('config.liveEdit')
    it('config.paginate')
  })

})

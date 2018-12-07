import { expect } from 'chai'
import declareEntity from '../declare-entity' // eslint-disable-line no-unused-vars
import { isApp, $$entity } from '../util'
import Emitter from 'events'
import { indexOf } from '@benzed/immutable'

// @jsx declareEntity
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('<app/>', () => {

  it('can be created by <app/>', () => {
    const app = <app port={2000} />

    expect(app[$$entity]).to.have.property('type', 'app')
  })

  describe('port prop', () => {

    it('must be a number', () => {
      expect(() => <app port='not-a-number' />).to.throw('app.port must be of type: Number')
    })

    it('must be between 1024 and 65534', () => {
      for (const outOfRange of [ 1023, 65536 ])
        expect(() => <app port={outOfRange} />).to.throw('app.port must be between 1024 and 65535')

      for (const outOfRange of [ 1024, 65534 ])
        expect(() => <app port={outOfRange} />).to.not.throw('app.port must be between 1024 and 65535')
    })

  })

  describe('entity function', () => {

    let app
    before(() => {
      app = (<app port='2000' foo='bar' />)()
    })

    it('creates a feathers app', () => {
      expect(isApp(app)).to.be.equal(true)
    })

    it('adds port and logging to feathers.settings', () => {
      expect(app.get('port')).to.be.equal(2000)
      expect(app.get('logging')).to.be.equal(false)
    })

    it('remaining props are placed in app.settings', () => {
      expect(app.settings.foo).to.be.equal('bar')
    })

    describe('added methods', () => {
      it('log', () => {
        expect(app.log).to.be.instanceof(Function)
      })
      it('start', () => {
        expect(app.start).to.be.instanceof(Function)
      })
      it('end', () => {
        expect(app.end).to.be.instanceof(Function)
      })
    })

    describe('added lifecycle events', () => {
      let app
      const events = []

      before(async () => {

        const test = { // eslint-disable-line no-unused-vars

          listener () {
            return app => {
              app.listen = () => {

                const fakeServer = new Emitter()

                fakeServer.close = func => func()

                setTimeout(() => {
                  events.push(['listening'])
                  fakeServer.emit('listening')
                }, 0)

                return fakeServer
              }
            }
          },

          event ({ type, children: func }) {
            return app => {
              app.on(
                type, (...args) => events.push([ type, ...args ])
              )
            }
          }
        }

        app = (<app>
          <test.listener />
          <test.event type='start' />
          <test.event type='listen' />
          <test.event type='end' />
        </app>)()

        await app.start()

        await app.end()

      })

      describe('start', () => {

        let event, args
        before(() => {
          ([ event, ...args ] = events[0])
        })

        it('first on app start', () => {
          expect(event).to.be.equal('start')
        })

        it('receives app as argument', () => {
          expect(args).to.include(app)
          expect(args).to.have.length(1)
        })

      })

      describe('listen', () => {

        let event, args
        before(() => {
          const index = events::indexOf(['listening']) + 1
          ;([ event, ...args ] = events[index])
        })

        it('first on app start', () => {
          expect(event).to.be.equal('listen')
        })

        it('receives app as argument', () => {
          expect(args).to.include(app)
          expect(args).to.have.length(1)
        })
      })

      describe('end', () => {

        let event, args
        before(() => {
          ;([ event, ...args ] = events[events.length - 1])
        })

        it('first on app end', () => {
          expect(event).to.be.equal('end')
        })

        it('receives app as argument', () => {
          expect(args).to.include(app)
          expect(args).to.have.length(1)
        })

      })
    })
  })
})

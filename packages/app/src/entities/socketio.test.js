import { expect } from 'chai'
import declareEntity from '../declare-entity' // eslint-disable-line no-unused-vars
import { $$entity } from '../util'
import { wrap } from '@benzed/array'
import { copy } from '@benzed/immutable'
import is from 'is-explicit'

// @jsx declareEntity
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('<socketio/>', () => {

  it('can be created by <socketio/>', () => {
    const sio = <socketio />
    expect(sio[$$entity]).to.have.property('type', 'socketio')
  })

  describe('entity function', () => {

    it('adds socketio provider to an app', () => {

      const app = <app />

      const feathers = app()
      expect(feathers).to.not.have.property('channel')

      const sio = <socketio />
      sio(feathers)

      expect(feathers).to.have.property('channel')
    })

    it('adds an app \'end\' listener that closes the socketio connection', () => {
      const app = (<app>
        <express/>
      </app>)()

      const end = app._events?.end
        ::wrap()
        .filter(is.func)
        ::copy()

      const socketio = <socketio/>
      socketio(app)

      expect(app._events?.end::wrap()).to.have.length(end.length + 1)
    })

    it('provided children are combined as socket middleware', async () => {

      const test = {
        args: [],
        callme (props) {
          return io => {
            test.args.push(io)
          }
        }
      }

      const app = (<app>
        <socketio>
          <test.callme/>
          <test.callme/>
        </socketio>
      </app>)()

      await app.start()

      expect(test.args).to.have.length(2)
      expect(test.args.every(io => io === app.io)).to.be.equal(true)

      await app.end()
    })

    it('throws if not invoked with app', () => {
      const entity = <socketio/>
      expect(entity).to.throw('<socketio/> must be parented to an <app/> entity')
    })

  })
})

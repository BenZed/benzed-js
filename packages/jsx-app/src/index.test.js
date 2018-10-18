import { expect } from 'chai'
import App from './index'
import is from 'is-explicit'

// @jsx App.declare
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('playing around with ideas', () => {

  it('just declares data, for now', () => {

    const app = <app>

      <socketio engine='uws' />
      <rest public='./dist/public' />

      <service name='users' path='/users'>
        <database adapter='nedb'/>
      </service>

    </app>

    expect(is.plainObject(app)).to.be.equal(true)
    expect(app).to.be.deep.equal({
      type: 'app',
      socketio: {
        engine: 'uws'
      },
      rest: {
        public: './dist/public'
      },
      service: {
        name: 'users',
        path: '/users',
        database: {
          adapter: 'nedb'
        }
      }
    })
  })
})

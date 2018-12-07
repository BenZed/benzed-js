import { expect } from 'chai'
import { $$entity } from '../util'
import declareEntity from '../declare-entity' // eslint-disable-line no-unused-vars
import { Test } from '@benzed/dev'
import { milliseconds } from '@benzed/async'

/* @jsx declareEntity */
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

const EVENTS = [ 'created', 'patched', 'removed', 'updated' ]

const useServiceMethods = async api => {

  await milliseconds(50)

  const things = api.service('things')
  const doc = await things.create({ some: 'thing' })
  await things.patch(doc._id, { some: 'thing-else' })
  await things.update(doc._id, { quaker: 'state' })

  await things.remove(doc._id)

}

describe('<channels />', () => {

  it('can be created by <channels />', () => {
    const channels = <channels />
    expect(channels[$$entity]).to.have.property('type', 'channels')
  })

  it('throws if not parented to a <socketio/> entity', () => {
    const bad = <app>
      <socketio/>
      <channels/>
    </app>

    expect(bad).to.throw('<channels/> must be parented to <socketio/>')

    const good = <app>
      <socketio>
        <channels />
      </socketio>
    </app>

    expect(good).to.not.throw(Error)
  })

  it('throws if given children', () => {

    expect(() => <channels>
      {() => {}}
    </channels>).to.throw('channels.children must be empty')

  })

  Test.Api(
    'in a non-auth socket io app',
    <app>
      <socketio>
        <channels />
      </socketio>

      <service name='things' />
    </app>,

    { provider: 'socketio' },

    state => {

      describe('allows connections to receive service events', () => {

        const events = { }

        before(async () => {
          for (const event of EVENTS) {
            events[event] = 0
            state.client.service('things').on(event, () => {
              events[event]++
            })
          }

          await useServiceMethods(state.api)
        })

        for (const key of EVENTS)
          it(key, () => {
            expect(events[key]).to.be.equal(1)
          })

      })

    })

  Test.Api(
    'in a auth socket.io app',

    <app>

      <express />
      <authentication />

      <socketio>
        <channels />
      </socketio>

      <service name='users'>
        <hooks before all>
          <password-hash />
        </hooks>
      </service>

      <service name='things' />
    </app>,

    state => {

      const events = { }

      before(() => {
        const client = state.client.service('things')
        for (const event of EVENTS) {
          events[event] = 0
          client.on(event, function trigger () {
            events[event]++
          })
        }

      })

      describe('events are not sent to unauthenticated users', () => {

        before(async () => {
          await useServiceMethods(state.api)
        })

        for (const key of EVENTS)
          it(key, () => {
            expect(events[key]).to.be.equal(0)
          })

      })

      describe('events are sent to unauthenticated users', () => {

        before(async () => {
          await state.api.service('users').create({
            email: 'some@user.com',
            password: 'password'
          })

          await state.client.authenticate({
            strategy: 'local',
            email: 'some@user.com',
            password: 'password'
          })

          await useServiceMethods(state.api)
        })

        for (const key of EVENTS)
          it(key, () => {
            expect(events[key]).to.be.equal(1)
          })
      })
    })
})

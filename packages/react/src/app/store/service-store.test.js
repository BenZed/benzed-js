import { expect } from 'chai'

import ServiceStore from './service-store'
import Store from '../../store/store'
import ClientStore from './client-store'

import ServiceRecord from './service-record'
import { createProjectAppAndTest } from '@benzed/app/test-util/test-project'
import { until, milliseconds } from '@benzed/async'
import { set, copy } from '@benzed/immutable'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/******************************************************************************/
// Helper
/******************************************************************************/

const SOCKETIOAPP = {
  socketio: true,
  port: 3456,
  services: {
    messages: {
      paginate: {
        default: 100,
        max: 1000
      }
    }
  }
}

const RESTAPP = SOCKETIOAPP
  ::set('socketio', v => !v)
  ::set('rest', v => !v)
  ::set('port', v => v + 1)

const clientForApp = app => new ClientStore({
  hosts: [ `http://localhost:${app.port}` ],
  provider: app.socketio
    ? 'socketio'
    : 'rest'
})

class Message extends ServiceRecord {

}

// class Messages extends ServiceStore {
//
// }

/******************************************************************************/
// Tests
/******************************************************************************/

describe('ServiceStore', () => {

  let client
  before(() => {
    client = clientForApp(SOCKETIOAPP)
  })

  it('is a store', () => {
    expect(new ServiceStore({ client, serviceName: 'cake' }))
      .to
      .be
      .instanceof(Store)
  })

  it('must be instantiated with a client store', () => {
    expect(() => new ServiceStore({ serviceName: 'cake' }))
      .to
      .throw('Must be instanced with a client store')
  })

  it('can be instantiated with a record type', () => {
    const store = new ServiceStore({ client, record: Message })
    expect(store.ServiceRecord)
      .to
      .be
      .equal(Message)
  })

  it('record type must be extended from ServiceRecord', () => {
    expect(() => new ServiceStore({ client, serviceName: 'cake', record: 100 }))
      .to
      .throw('record must be a subclass of ServiceRecord')
  })

  for (const APP of [ SOCKETIOAPP, RESTAPP ]) createProjectAppAndTest(APP::copy(), state => {

    let messages, queue
    before(async () => {

      const client = clientForApp(APP)

      messages = new ServiceStore({
        client: client,
        record: Message
      })

      const QUERY_QUEUE = Object
        .getOwnPropertySymbols(messages)
        .filter(s => String(s).includes('query'))[0]

      queue = messages[QUERY_QUEUE]

      await client.connect()
    })

    const APP_TYPE = APP.rest ? 'rest' : 'socketio'

    describe(`querying in ${APP_TYPE} app`, () => {

      let docs
      beforeEach(async () => {
        const messagesService = state.app.feathers.service('messages')
        docs = await messagesService.find({})
        while (docs.data.length < 10) {
          await messagesService.create({ body: `Message number ${docs.data.length + 1}!` })
          docs = await messagesService.find({})
        }
      })

      describe('find()', () => {

        it('asyncronously fills query requests', async () => {
          messages.records.clear()

          await messages.find({ })

          expect(messages.records).to.have.property('size', docs.data.length)
        })

        it('only queues fetch if query is unique', () => {
          messages.records.clear()

          messages.find({ _id: { $lt: 5 } })
          expect(queue.items).to.have.length(1)

          messages.find({ _id: { $gte: 5 } })
          expect(queue.items).to.have.length(2)

          messages.find({ _id: { $lt: 5 } })
          expect(queue.items).to.have.length(2)
        })

      })

      describe('get()', () => {

        it('syncronously returns a record', async () => {
          messages.records.clear()

          const record = messages.get(0)
          expect(record.id).to.be.equal(0)
          expect(record.status).to.be.equal('unfetched')
          await until(() => record.status === 'fetched')

          expect(record.status).to.be.equal('fetched')
          expect(record.getData('body')).to.be.equal(`Message number 1!`)
        })

        it('gotten record is instance of store.config.record', () => {
          expect(messages.get(0)).to.be.instanceof(Message)
        })

        it('returns an array of records if provided an array of ids', async () => {
          messages.records.clear()

          const msgs = messages.get([ 0, 1 ])

          expect(msgs.map(msg => msg.status))
            .to.deep.equal([ 'unfetched', 'unfetched' ])

          await messages.untilFetchingComplete()

          expect(messages.records.get(0))
            .to.have.property('status', 'fetched')
          expect(messages.records.get(1))
            .to.have.property('status', 'fetched')
        })

        it('only queues a fetch if records havent been fetched yet', async () => {
          await messages.find({})
          expect(queue.items).to.have.length(0)

          messages.get([0, 1, 2])
          expect(queue.items).to.have.length(0)
        })

        it('unscopable records receive an \'unscoped\' status', async () => {
          const record = messages.get(-1)
          await messages.untilFetchingComplete()
          expect(record.status).to.be.equal('unscoped')
        })
      })
    })

    describe(`events in ${APP_TYPE} app`, () => {

      before(() => client.connect())

      it('listens to create events', async () => {

        const newDoc = await state
          .app
          .messages
          .create({ body: 'New Message!' })

        await milliseconds(50)

        const message = messages.records.get(newDoc._id)
        expect(message)
          .to.be.instanceof(Message)

        expect(message)
          .to.have.property('id', newDoc._id)

        await state.app.messages.remove(newDoc._id)
      })

    })
  })
})

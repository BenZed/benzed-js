import { expect } from 'chai'

import ServiceStore from './service-store'
import Store from '../../store/store'
import ClientStore from './client-store'

import ServiceRecord from './service-record'
import { createProjectAppAndTest } from '@benzed/app/test-util/test-project'
import { milliseconds } from '@benzed/async'
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

          await messages.untilFetchingComplete()
        })

        it('only queues fetch if query is unique', async () => {
          messages.records.clear()

          messages.find({ _id: { $lt: 5 } })
          expect(queue.items).to.have.length(1)

          messages.find({ _id: { $gte: 5 } })
          expect(queue.items).to.have.length(2)

          messages.find({ _id: { $lt: 5 } })
          expect(queue.items).to.have.length(2)

          await messages.untilFetchingComplete()
        })

      })

      describe('get()', () => {

        it('syncronously returns a record', async () => {
          messages.records.clear()

          const record = messages.get(0)
          expect(record.id).to.be.equal(0)
          expect(record.status).to.be.equal('unfetched')

          await messages.untilFetchingComplete()

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

    if (APP_TYPE !== 'rest') describe(`events in ${APP_TYPE} app`, () => {

      const docs = []
      before(async () => {
        await client.connect()
        const { messages } = state.app
        docs.push(
          await messages.create({ body: 'New Message!' }),
          await messages.create({ body: 'New Message! with error >:(' }),
          await messages.create({ body: 'New Message! with error >:(' }),
          await messages.create({ body: 'Redundant Message.' }),
          await messages.create({ body: 'Empty.' })
        )

        await messages.patch(docs[1]._id, { body: 'Patched Message.' })
        await messages.update(docs[2]._id, { body: 'Updated Message.' })
        await messages.remove(docs[3]._id)

        await milliseconds(10)
      })

      it('listens to create events', async () => {
        const [ doc ] = docs

        const message = messages.records.get(doc._id)
        expect(message)
          .to.be.instanceof(Message)

        expect(message)
          .to.have.property('id', doc._id)

        await state.app.messages.remove(doc._id)
      })

      it('listens to patch events', () => {
        const doc = docs[1]
        const message = messages.records.get(doc._id)
        expect(message.getData('body')).to.be.equal('Patched Message.')
      })

      it('listens to update events', () => {
        const doc = docs[2]
        const message = messages.records.get(doc._id)
        expect(message.getData('body')).to.be.equal('Updated Message.')
      })

      it('only patches or updates records if they\'re scoped', async () => {
        messages.records.clear()

        await state.app.messages.patch(docs[4]._id, { body: 'updated' })
        await milliseconds(10)
        expect(messages.records.get(docs[4]._id)).to.be.equal(undefined)

        await state.app.messages.update(docs[4]._id, { body: 'updated' })
        await milliseconds(10)
        expect(messages.records.get(docs[4]._id)).to.be.equal(undefined)

        return messages.find({})
      })

      it('listens to remove events', () => {
        expect(messages.records.has(docs[3]._id)).to.be.equal(false)
      })
    })
  })
})

import { expect } from 'chai'

import ServiceStore from './service-store'
import Store from '../../store/store'
import ClientStore from './client-store'

import ServiceRecord from './service-record'
import { createProjectAppAndTest } from '@benzed/app/test-util/test-project'
import { until } from '@benzed/async'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/******************************************************************************/
// Helper
/******************************************************************************/

const APP = {
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

const clientForApp = app => new ClientStore({
  hosts: [ `localhost:${app.port}` ],
  provider: app.socketio ? 'socketio' : 'rest'
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
    client = clientForApp(APP)
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

  createProjectAppAndTest(APP, state => {

    describe('querying', () => {

      let docs
      beforeEach(async () => {
        const messagesService = state.app.feathers.service('messages')
        docs = await messagesService.find({})
        while (docs.data.length < 10) {
          await messagesService.create({ body: `Message number ${docs.data.length + 1}!` })
          docs = await messagesService.find({})
        }
      })

      let messages
      before(async () => {
        messages = new ServiceStore({
          client: client,
          record: Message
        })

        await client.connect()
      })

      describe('find()', () => {

        it('asyncronously fills query requests', async () => {
          messages.records.clear()

          await messages.find({ _id: { $lt: 5 } })
          expect(messages.records).to.have.property('size', 5)

          await messages.find({ _id: { $gte: 5 }, $limit: 2 })
          await messages.find({ _id: { $gte: 5 }, $limit: 3, $skip: 2 })

          expect(messages.records).to.have.property('size', docs.data.length)
        })

      })

      describe('get()', () => {

        it('syncronously returns a record', async () => {
          messages.records.clear()

          expect(messages.get(0))
            .to.be
            .deep.equal({ _id: 0, scoped: false, body: null })

          await until(() => messages.get(0).scoped !== false)

          expect(messages.get(0))
            .to.be
            .deep.equal({ _id: 0, scoped: true, body: 'Message number 1!' })
        })
      })
    })
  })
})

import { expect } from 'chai'
import ServiceStateTree, { $$queue } from './service-state-tree'
import ClientStateTree, { $$feathers } from './client-state-tree'
import is from 'is-explicit'

import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import { milliseconds } from '@benzed/async'
import App from '@benzed/app'
import { Test } from '@benzed/dev'
import { first, last } from '@benzed/array'

// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope */
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach  */

/******************************************************************************/
// Helper
/******************************************************************************/

const CLIENT_CONFIG = {
  hosts: 'http://localhost:6000',
  provider: 'rest'
}

/******************************************************************************/
// Tests
/******************************************************************************/

describe('Service StateTree', () => {

  describe('config', () => {

    it('requires a client state tree', () => {
      expect(() => new ServiceStateTree({ client: () => {} }))
        .to.throw('config.client must be of type: ClientStateTree')
    })

    it('requires a service name', () => {
      expect(() => new ServiceStateTree({
        client: new ClientStateTree(CLIENT_CONFIG),
        serviceName: null })
      ).to.throw('config.serviceName is required')
    })

    it('config gets placed on tree', () => {
      const tree = new ServiceStateTree({
        client: new ClientStateTree(CLIENT_CONFIG),
        serviceName: 'users'
      })

      expect(tree).to.have.property('config')
      expect(tree.config).to.have.property('client')
      expect(tree.config).to.have.property('serviceName', 'users')
    })

  })

  describe('initial state', () => {

    let comments, keys
    before(() => {
      comments = new ServiceStateTree({
        client: new ClientStateTree(CLIENT_CONFIG),
        serviceName: 'comments'
      })
      keys = Object.keys(comments.state)
    })

    it('has keys: timestamp, fetching', () => {
      expect(keys).to.be.deep.equal([ 'timestamp', 'fetching' ])
    })

    it('has $$records symbol', () => {
      const symbols = Object.getOwnPropertySymbols(comments.state)
      expect(symbols.filter(sym => sym.toString().includes('hash-by-id'))).to.have.length(1)
    })

    it('client.timestamp to be a date', () => {
      expect(comments.timestamp).to.be.instanceof(Date)
    })

    it('client.records is an array', () => {
      expect(comments.records).to.be.instanceof(Array)
      expect(comments.records).to.have.length(0)
    })

  })

  for (const provider of [ 'express', 'socketio' ])
    Test.Api(App.declareEntity('app', {},
      App.declareEntity(provider, {}, [
        provider === 'socketio'
          ? App.declareEntity('channels', {}, [])
          : null
      ]),
      App.declareEntity('service', { name: 'messages', multi: true }, [])
    ), state => {

      let client, messages, queue
      before(function () {

        this.timeout(5000)

        client = new ClientStateTree({
          provider: provider === 'express' ? 'rest' : 'socketio',
          hosts: state.address
        })

        messages = new ServiceStateTree({
          serviceName: 'messages',
          client
        })

        queue = messages[$$queue]

        return client.connect()
      })

      describe(`querying in a non-auth ${provider} app`, () => {

        let docs
        beforeEach(async () => {
          const service = state.api.service('messages')
          docs = await service.find({})
          while (docs.length < 10) {
            await service.create({
              _id: `${docs.length}`,
              body: `Message number ${docs.length + 1}!`
            })
            docs = await service.find({})
          }
        })

        describe('find()', () => {
          it('asyncronously fills query requests', async () => {
            messages.setRecords([])
            await messages.find()
            expect(messages.records).to.have.property('length', docs.length)
          })
          it('only queues fetch if query is unique', async () => {
            messages.setRecords([])

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
            messages.setRecords([])

            let record = messages.get('0')
            expect(record._id).to.be.equal('0')
            expect(record._status).to.be.equal('unfetched')

            await messages.untilFetchingComplete()

            record = messages.get('0')
            expect(record._status).to.be.equal('scoped')
            expect(record.body).to.be.equal(`Message number 1!`)
          })
          it('returns an array of records if provided an array of ids', async () => {
            messages.setRecords([])

            let msgs = messages.get([ '0', '1' ])

            expect(msgs.map(msg => msg._status))
              .to.deep.equal([ 'unfetched', 'unfetched' ])

            await messages.untilFetchingComplete()
            msgs = messages.get([ '0', '1' ])

            expect(msgs.map(msg => msg._status))
              .to.deep.equal([ 'scoped', 'scoped' ])
          })
          it('only queues a fetch if records haven\'t been fetched yet', async () => {
            await messages.find({})
            expect(queue.items).to.have.length(0)

            messages.get(['0', '1', '2'])
            expect(queue.items).to.have.length(0)
          })
          it('unscoped records receive \'unscoped\' status', async () => {
            let record = messages.get('-1')
            await messages.untilFetchingComplete()

            record = messages.get('-1')
            expect(record._status).to.be.equal('unscoped')
          })
        })
      })

      if (provider === 'socketio')
        describe(`events in a non-auth ${provider} app`, () => {

          const docs = []
          before(async () => {
            const service = state.api.service('messages')
            messages.setRecords([])

            docs.push(
              await service.create({ body: 'New Message!' }),
              await service.create({ body: 'New Message! with error >:(' }),
              await service.create({ body: 'New Message! with error >:(' }),
              await service.create({ body: 'Redundant Message.' }),
              await service.create({ body: 'Empty.' })
            )

            await service.patch(docs[1]._id, { body: 'Patched Message.' })
            await service.update(docs[2]._id, { body: 'Updated Message.' })
            await service.remove(docs[3]._id)

            await milliseconds(10)
          })

          it('listens to create events', () => {
            const [ doc ] = docs

            const [ record ] = messages.records.filter(r => r._id === doc._id)
            expect(is.plainObject(record))
              .to.be.equal(true)

            expect(record)
              .to.have.property('_id', doc._id)
          })

          it('listens to patch events', () => {
            const doc = docs[1]
            const [ record ] = messages.records.filter(r => r._id === doc._id)
            expect(record.body).to.be.equal('Patched Message.')
          })

          it('listens to update events', () => {
            const doc = docs[2]
            const [ record ] = messages.records.filter(r => r._id === doc._id)
            expect(record.body).to.be.equal('Updated Message.')
          })

          it('listens to remove events', () => {
            const id3 = docs[3]._id
            expect(messages.records.filter(r => r._id === id3))
              .to.be.deep.equal([])
          })

          it('only patches or updates records if they\'re scoped', async () => {
            messages.setRecords([])

            const service = state.api.service('messages')

            const id4 = docs[4]._id
            const getRecord = id => messages.records.filter(r => r._id === id)[0]

            await service.patch(id4, { body: 'updated' })
            await milliseconds(10)
            expect(getRecord(id4)).to.be.equal(undefined)

            await service.update(id4, { body: 'updated' })
            await milliseconds(10)
            expect(getRecord(id4)).to.be.equal(undefined)

            return messages.find({})
          })
        })

      describe(`editing records in a non-auth ${provider} app`, () => {

        let $$forms
        before(async () => {

          await state.api.service('messages').remove(null)

          const apiMessages = await state.api.service('messages').find({ })
          if (apiMessages.length < 10) {
            const data = Array
              .from({ length: 10 - apiMessages.length })
              .map((undef, index) => ({
                body: 'Message-' + (index + apiMessages.length),
                author: 'Me :)'
              }))

            await state.api.service('messages').create(data)
          }

          $$forms = Object
            .getOwnPropertySymbols(messages.state)
            .filter(sym => sym.toString().includes('form'))
            ::first()

          await messages.find({})

        })

        it('form state trees are instanced for each record on .getForm', async () => {

          const { _id: id } = messages.records[0]
          const form = messages.getForm(id)

          expect(messages.state[$$forms][id])
            .to
            .be
            .equal(form)

          form.editCurrent('author', 'Ol Fackin Jerry')
          form.pushCurrent()
          await form.pushUpstream()
          await milliseconds(10)

          expect(form.upstream.author).to.be.equal(messages.get(id).author)

          expect(form.hasChangesToCurrent).to.be.equal(false)
          expect(form.hasChangesToUpstream).to.be.equal(false)
        })

        it('.getForm queries record is not loaded', () => {
          expect(() => messages.getForm('123412')).to.not.throw(Error)
        })

        if (provider === 'socketio')
          it('deleting a record deletes its form', async () => {
            const docs = await state.api.service('messages').find({})
            const doc = last(docs)

            await messages.find({})
            const form = await messages.getForm(doc._id)

            await state.api.service('messages').remove(doc._id)
            await milliseconds(25)

            expect(messages.forms.filter(f => f === form)).to.have.length(0)
          })

      })
    })
})

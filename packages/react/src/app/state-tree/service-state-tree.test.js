import { expect } from 'chai'
import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import ServiceStateTree, { $$queue } from './service-state-tree'
import ClientStateTree, { $$feathers } from './client-state-tree'
import { milliseconds } from '@benzed/async'
import is from 'is-explicit'
import { $$state } from '../../state-tree/state-tree'
import App from '@benzed/app'
import { Test } from '@benzed/dev'

// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope */
// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach  */

/******************************************************************************/
// Helper
/******************************************************************************/

const fakeClientStateTree = () => {}
fakeClientStateTree[$$state] = {}
fakeClientStateTree[$$feathers] = {}
fakeClientStateTree.connect = () => {}

/******************************************************************************/
// Tests
/******************************************************************************/

describe('Service StateTree', () => {

  describe('config', () => {
    it('requires a client state tree', () => {
      expect(() => new ServiceStateTree({ client: () => {} }))
        .to.throw('config.client must be a ClientStateTree')
    })
    it('requires a service name', () => {
      expect(() => new ServiceStateTree({
        client: fakeClientStateTree,
        serviceName: null })
      ).to.throw('config.serviceName is required')
    })
    it('config gets placed on tree', () => {
      const tree = new ServiceStateTree({
        client: fakeClientStateTree,
        serviceName: 'users'
      })

      expect(tree).to.have.deep.property('config', {
        client: fakeClientStateTree,
        serviceName: 'users'
      })
    })
  })

  describe('initial state', () => {

    let comments, keys
    before(() => {
      comments = new ServiceStateTree({
        client: fakeClientStateTree,
        serviceName: 'comments'
      })
      keys = Object.keys(comments[$$state])
    })
    it('has keys: records, drafts, errors, timestamp', () => {
      expect(keys).to.be.deep.equal([ 'records', 'drafts', 'errors', 'timestamp' ])
    })
    it('client.timestamp to be a date', () => {
      expect(comments.timestamp).to.be.instanceof(Date)
    })
    it('client.records is a plain object with a count property', () => {
      expect(comments.records).to.be.have.property('count', 0)
    })
    it('state can be extended', () => {
      const articles = new ServiceStateTree({
        client: fakeClientStateTree,
        serviceName: 'articles'
      }, {
        bestAuthor: null
      })

      expect(Object.keys(articles[$$state])).to.be.deep.equal([
        'records', 'drafts', 'errors', 'timestamp', 'bestAuthor'
      ])
    })
  })

  describe('actions', () => {
    it('can be extended', () => {

      const thingsWithState = new ServiceStateTree({
        serviceName: 'things',
        client: fakeClientStateTree
      }, {
        bestThing: null
      }, {
        setBestThing (value) {
          this('bestThing').set(value)
        }
      })

      expect(thingsWithState.bestThing).to.be.equal(null)
      expect(thingsWithState.setBestThing).to.be.instanceof(Function)

    })
    it('actions argument is intelligent', () => {
      const thingsWithActionsAndNoState = new ServiceStateTree({
        serviceName: 'things',
        client: fakeClientStateTree
      }, {
        doThing () {}
      })

      expect(thingsWithActionsAndNoState[$$state]).to.not.have.property('doThing')
      expect(thingsWithActionsAndNoState.doThing).to.be.instanceof(Function)
    })
  })

  for (const provider of [ 'express', 'socketio' ])
    Test.Api(App.declareEntity('app', {},
      App.declareEntity(provider, {})
      // App.declareEntity('service', { name: 'messages' }, [
      // ])
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
            await service.create({ body: `Message number ${docs.length + 1}!` })
            docs = await service.find({})
          }
        })

        describe('find()', () => {
          it('asyncronously fills query requests', async () => {
            messages('records').set({ count: 0 })
            await messages.find()
            expect(messages.records).to.have.property('count', docs.length)
          })
          it('only queues fetch if query is unique', async () => {
            messages('records').set({ count: 0 })

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
            messages('records').set({ count: 0 })

            let record = messages.get(0)
            expect(record._id).to.be.equal(0)
            expect(record.status).to.be.equal('unfetched')

            await messages.untilFetchingComplete()

            record = messages.get(0)
            expect(record.status).to.be.equal('scoped')
            expect(record.body).to.be.equal(`Message number 1!`)
          })
          it('returns an array of records if provided an array of ids', async () => {
            messages('records').set({ count: 0 })

            let msgs = messages.get([ 0, 1 ])

            expect(msgs.map(msg => msg.status))
              .to.deep.equal([ 'unfetched', 'unfetched' ])

            await messages.untilFetchingComplete()
            msgs = messages.get([ 0, 1 ])

            expect(msgs.map(msg => msg.status))
              .to.deep.equal([ 'scoped', 'scoped' ])
          })
          it('only queues a fetch if records haven\'t been fetched yet', async () => {
            await messages.find({})
            expect(queue.items).to.have.length(0)

            messages.get([0, 1, 2])
            expect(queue.items).to.have.length(0)
          })
          it('unscoped records receive \'unscoped\' status', async () => {
            let record = messages.get(-1)
            await messages.untilFetchingComplete()

            record = messages.get(-1)
            expect(record.status).to.be.equal('unscoped')
          })
        })

      })

      if (provider === 'socketio')
        describe(`events in a non-auth ${provider} app`, () => {

          const docs = []
          before(async () => {
            const service = state.api.service('messages')
            messages('records').set({ count: 0 })

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

            const record = messages.records[doc._id]
            expect(is.plainObject(record))
              .to.be.equal(true)

            expect(record)
              .to.have.property('_id', doc._id)
          })

          it('listens to patch events', () => {
            const doc = docs[1]
            const record = messages.records[doc._id]
            expect(record.body).to.be.equal('Patched Message.')
          })

          it('listens to update events', () => {
            const doc = docs[2]
            const record = messages.records[doc._id]
            expect(record.body).to.be.equal('Updated Message.')
          })

          it('listens to remove events', () => {
            expect(docs[3]._id in messages.records).to.be.equal(false)
          })

          it('only patches or updates records if they\'re scoped', async () => {
            messages('records').set({ count: 0 })

            const service = state.api.service('messages')

            await service.patch(docs[4]._id, { body: 'updated' })
            await milliseconds(10)
            expect(messages.records[docs[4]._id]).to.be.equal(undefined)

            await service.update(docs[4]._id, { body: 'updated' })
            await milliseconds(10)
            expect(messages.records[docs[4]._id]).to.be.equal(undefined)

            return messages.find({})
          })
        })
    })
})

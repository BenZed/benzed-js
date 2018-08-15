import { expect } from 'chai'

import castIds from './cast-query-ids'
import { PRIORITY } from './hook'
import App from '../app'

import { expectReject } from '@benzed/dev'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('cast-query-ids hook', () => {

  it('is a hook function', () => {
    expect(castIds)
      .to.be
      .instanceof(Function)

    expect(castIds()).to.have.property(PRIORITY)
  })

  let app

  before(async () => {

    const config = {
      services: {
        things: true
      },
      port: 6525,
      rest: true
    }

    app = new App(config)

    await app.initialize()

    await app.things.create([
      { foo: 'bar' },
      { cake: 'town' },
      { gold: 'bullion' }
    ])

  })

  it('cast ids in queries to a type the database adapter expects', async () => {
    const { things } = app

    const [ { _id } ] = await things.find({})

    const docs = await things.find({ query: { _id: String(_id) } })

    expect(docs).to.have.length(1)
  })

  it('works with adapter interface', async () => {
    const { things } = app

    const all = await things.find({})

    const docs = await things.find({
      query: {
        _id: {
          '$in': all.map(d => `${d._id}`)
        }
      }
    })

    expect(docs).to.have.length(all.length)

  })

  it('throws if ids could not be converted', async () => {

    await app.things.find({
      query: {
        _id: 'should-be-NaN'
      }
    })::expectReject('query ids could not be converted to Number')

    await app.things.find({
      query: {
        _id: [ 'NaN', 'NaN' ]
      }
    })::expectReject('query ids could not be converted to Number')

    await app.things.find({})
  })

  after(() =>
    app && app.end && app.end()
  )

})

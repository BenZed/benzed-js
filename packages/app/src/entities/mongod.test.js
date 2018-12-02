import { expect } from 'chai'
import declareEntity from '../declare-entity' // eslint-disable-line no-unused-vars
import { $$entity } from '../util'

// @jsx declareEntity
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('<mongod/>', () => {

  it('can be created by <mongod/>', () => {
    const mongod = <mongod />
    expect(mongod[$$entity]).to.have.property('type', 'mongod')
  })

  describe('entity function', () => {

    it('sets mongodb property on app')
    it('connects to database')
    it('disconnects from database on app close')
    it('uses auth if provided with a username and password')
    it('throws is provided children')
    it('throws if not invoked with app')

    describe('creates mongodb process', () => {

      it('if a single local host was defined')
      it('uses dbpath if provided')
      it('throws if mongo process exists')
      it('throws if mongo is not installed')
      it('process is shut down on app close')

    })
  })

  // describe.only('mongoclient close test', () => {
  //
  //   it.only('mongodb close test', async () => {
  //     const { MongoClient } = require('mongodb')
  //
  //     const uri = `mongodb://localhost:27017/test`
  //
  //     const client = await MongoClient.connect(uri, { useNewUrlParser: true })
  //     await client.close()
  //   })
  //
  // })

})

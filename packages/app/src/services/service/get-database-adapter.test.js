import { expect } from 'chai'
import getDatabaseAdapter from './get-database-adapter'
import App from 'src/app'
import { Service as MongoService } from 'feathers-mongodb'
import { Service as MemoryService } from 'feathers-memory'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('getDatabaseAdapter()', () => {

  it('is a function', () => {
    expect(getDatabaseAdapter).to.be.instanceof(Function)
  })

  let appWithDb, appWithoutDb

  before(async () => {
    try {
      appWithDb = new App({
        port: 6234,
        logging: false,
        mongodb: {
          hosts: [ 'localhost:5716' ],
          database: 'test-db'
        },
        socketio: true
      })

      await appWithDb.initialize()

      appWithoutDb = new App({
        port: 6236,
        socketio: true,
        logging: false
      })

      await appWithoutDb.initialize()
    } catch (err) {
      console.error(err)
    }

  })

  describe('if app has database and database link', () => {
    let slickJimmyService
    before(() => {
      slickJimmyService = getDatabaseAdapter(appWithDb, 'slick-jimmys')
    })
    it('returns a mongodb service', () => {
      expect(slickJimmyService).to.be.instanceof(MongoService)
    })
    it('uses service name as collection name', () => {
      expect(slickJimmyService.Model.s.name).to.be.equal('slick-jimmys')
    })
    it('uses \'_id\' as id field', () => {
      expect(slickJimmyService).to.have.property('id', '_id')
    })
    // TODO figure out pagination
    it('uses pagination options')
  })

  describe('otherwise', () => {
    let smoothJennyService
    before(() => {
      smoothJennyService = getDatabaseAdapter(appWithoutDb, 'smooth-jennys')
    })
    it('returns a memory service', () => {
      expect(smoothJennyService).to.be.instanceof(MemoryService)
    })
    it('uses \'_id\' as id field', () => {
      expect(smoothJennyService).to.have.property('id', '_id')
    })
    // TODO figure out pagination
    it('uses pagination options')
  })

  after(async () => {
    try {
      await appWithDb.end()
      await appWithoutDb.end()
    } catch (err) {
      console.log(err.message)
    }
  })

})

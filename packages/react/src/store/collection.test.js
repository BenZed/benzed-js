import { expect } from 'chai'

import { Store } from './store'
import StoreCollection from './collection'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('StoreCollection', () => {

  it('is a class', () => {
    expect(StoreCollection).to.throw('cannot be invoked without \'new')
  })

  class Comment extends Store {

    body = null

    constructor (body) {
      super()
      this.body = body
    }

  }

  class Comments extends StoreCollection {
    constructor () {
      super(Comment)
    }
  }

  describe('construction', () => {

    it('takes a store type as argument', () => {
      const collection = new StoreCollection(Comment)
      const [ STORE ] = Object.getOwnPropertySymbols(collection)
      expect(collection[STORE]).to.be.equal(Comment)
    })

    it('defaults to Store', () => {
      const collection = new StoreCollection()
      const [ STORE ] = Object.getOwnPropertySymbols(collection)
      expect(collection[STORE]).to.be.equal(Store)
    })

    it('throws if not a store', () => {
      expect(() => new StoreCollection(Array)).to.throw('Must be constructed with a subclass of Store')
    })

  })

  describe('methods', () => {

    describe('subscribe', () => {
      it('registers a store subscriber method', () => {

        const comments = new Comments()
        const SUBSCRIBER = Object.getOwnPropertySymbols(comments)[1]

        comments.subscribe(() => {})

        expect(comments[SUBSCRIBER]).to.have.length(1)
      })
      it('throws if argument is not a method', () => {
        const comments = new Comments()

        for (const badValue of [ null, false, true, 0, Symbol('symbol'), 'cake' ])
          expect(() => comments.subscribe(badValue))
            .to
            .throw('callback argument must be a function')
      })
      it('returns collection', () => {
        const comments = new Comments()
        expect(comments.subscribe(() => {})).to.be.equal(comments)
      })
    })

    describe('unsubscribe', () => {
      const sub = () => {}

      it('removes subscriber', () => {
        const comments = new Comments()
        const SUBSCRIBER = Object.getOwnPropertySymbols(comments)[1]

        comments.subscribe(sub)
        comments.unsubscribe(sub)

        expect(comments[SUBSCRIBER]).to.have.length(0)
      })

      it('throws if argument is not a method', () => {
        const comments = new Comments()

        for (const badValue of [ null, false, true, 0, Symbol('symbol'), 'cake' ])
          expect(() => comments.unsubscribe(badValue))
            .to
            .throw('callback argument must be a function')
      })

      it('returns the number of subscribers removed', () => {
        const comments = new Comments()
        const sub1 = () => {}
        const sub2 = () => {}
        comments.subscribe(sub1)
        comments.subscribe(sub2)
        comments.subscribe(sub2)

        expect(comments.unsubscribe(sub)).to.be.equal(0)
        expect(comments.unsubscribe(sub1)).to.be.equal(1)
        expect(comments.unsubscribe(sub2)).to.be.equal(2)
      })

    })

    describe('set', () => {
      it('sets a collection key to a value', () => {
        const comments = new Comments()
        const ace = new Comment('Ace test here, bud.')
        comments.set(0, ace)

        expect(comments[0]).to.be.equal(ace)
      })

      it('notifies subscribers', () => {
        let called = false

        const comments = new Comments()

        comments.subscribe(() => { called = true })
        comments.set(0, new Comment())
        expect(called).to.be.equal(true)
      })

      it('increments count', () => {
        const comments = new Comments()
        const comment1 = new Comment('1')
        const comment2 = new Comment('2')

        expect(comments.count).to.be.equal(0)

        // writing a key increments count
        comments.set(2, comment1)
        expect(comments.count).to.be.equal(1)

        // overrwriting a key does not increment count
        comments.set(2, comment2)
        expect(comments.count).to.be.equal(1)

        // order irrelevent
        comments.set(1, comment1)
        expect(comments.count).to.be.equal(2)
      })

      it('throws if item is not an instance of Store', () => {
        const comments = new Comments()
        expect(() => comments.set(0, {})).to.throw('must be an instance of Store')
      })

      it('throws if key is not a string or number', () => {
        const comments = new Comments()
        const comment = new Comment('test me')
        for (const badKey of [ {}, true, [], NaN, null, undefined ])
          expect(() => comments.set(badKey, comment)).to.throw('key must be a string or number')

      })

      it('throws if key is invalid', () => {
        const comments = new Comments()
        const comment = new Comment('test me')

        for (const invalid of ['constructor', 'count', 'set'])
          expect(() => comments.set(invalid, comment)).to.throw('is an invalid key.')

      })

      it('returns store collection', () => {
        const comments = new Comments()
        const comment = new Comment('test me')

        expect(comments.set(0, comment)).to.be.equal(comments)
      })
    })

    describe('get', () => {

      it('gets a value for a key', () => {
        const comments = commentsSeeded()
        expect(comments.get(0)).to.be.instanceof(Comment)
      })

      it('throws if key is invalid', () => {
        const comments = new Comments()
        expect(() => comments.get([])).to.throw('key must be a string or number')

        for (const invalid of ['constructor', 'count', 'get', 'set'])
          expect(() => comments.get(invalid)).to.throw('invalid key')
      })

      it('returns undefined if key is missing', () => {
        const comments = commentsSeeded()
        expect(comments.get(3)).to.be.equal(undefined)
      })

    })

    describe('has', () => {

      it('returns true if collection has key', () => {
        const comments = commentsSeeded()
        expect(comments.has(0)).to.be.equal(true)
      })

      it('returns false if collection does not have key', () => {
        const comments = commentsSeeded()
        expect(comments.has(3)).to.be.equal(false)
      })

      it('throws if key is invalid', () => {
        const comments = new Comments()
        expect(() => comments.get([])).to.throw('key must be a string or number')

        for (const invalid of ['constructor', 'count', 'get', 'set'])
          expect(() => comments.get(invalid)).to.throw('invalid key')
      })

    })

    describe('delete', () => {

      it('removes items from store', () => {
        const comments = new Comments()
        const comment = new Comment('eh')

        comments.set('eh', comment)
        expect(comments).have.property('eh', comment)

        comments.delete('eh')
        expect(comments).to.not.have.property('eh')
      })

      it('notifies subscribers', () => {
        const comments = new Comments()
        const comment = new Comment('eh')

        let called = false

        comments.set(0, comment)
        comments.subscribe(() => { called = true })
        comments.delete(0)

        expect(called).to.be.equal(true)
      })

      it('doesnt notify subscribers if key does not exist in store', () => {
        const comments = new Comments()

        let called = false
        comments.subscribe(() => { called = true })
        comments.delete(0)

        expect(called).to.be.equal(false)
      })

      it('decrements count', () => {
        const comments = new Comments()
        const comment = new Comment('eh')

        comments.set(0, comment)
        expect(comments.count).to.be.equal(1)

        comments.delete(0)
        expect(comments.count).to.be.equal(0)

        // doesnt decrement count if key was not in store
        comments.delete(0)
        expect(comments.count).to.be.equal(0)
      })

      it('returns true if key was in store', () => {
        const comments = new Comments()
        const comment = new Comment('eh')

        comments.set(0, comment)
        expect(comments.delete(0)).to.be.equal(true)
      })

      it('returns false otherwise', () => {
        const comments = new Comments()

        expect(comments.delete(0)).to.be.equal(false)
      })
    })

    const commentsSeeded = () => new Comments()
      .set(0, new Comment('zero'))
      .set(1, new Comment('one'))

    describe('keys', () => {
      it('returns an iterator containing all keys', () => {
        const comments = commentsSeeded()
        const keys = [ ...comments.keys() ]
        expect(keys).to.deep.equal(['0', '1'])
      })
    })

    describe('values', () => {
      it('returns an iterator containing all values', () => {
        const comments = commentsSeeded()
        const values = [ ...comments.values() ]
        expect(values).to.have.length(2)
        expect(values[0]).to.be.equal(comments.get(0))
        expect(values[1]).to.be.equal(comments.get(1))
      })
    })

    describe('entries', () => {
      it('returns an iterator containing all key values', () => {
        const comments = commentsSeeded()
        const values = [ ...comments.entries() ]

        expect(values).to.have.length(2)
        expect(values[0][0]).to.be.equal('0')
        expect(values[0][1]).to.be.equal(comments.get(0))
        expect(values[1][0]).to.be.equal('1')
        expect(values[1][1]).to.be.equal(comments.get(1))
      })
    })

    describe('Symbol.iterator', () => {
      it('returns an iterator containing all key values', () => {
        const comments = commentsSeeded()
        const values = [ ...comments ]

        expect(values).to.have.length(2)
        expect(values[0][0]).to.be.equal('0')
        expect(values[0][1]).to.be.equal(comments.get(0))
        expect(values[1][0]).to.be.equal('1')
        expect(values[1][1]).to.be.equal(comments.get(1))
      })
    })

    describe('Symbol.toStringTag', () => {
      it('returns [object StoreCollection]', () => {
        const comments = new Comments()

        expect(comments::Object.prototype.toString())
          .to.be.equal('[object StoreCollection]')
      })
    })

    describe('clear', () => {

      it('removes all entries', () => {
        const comments = commentsSeeded()
        comments.clear()
        expect(comments).to.not.have.property(0)
        expect(comments).to.not.have.property(1)
      })

      it('sets count to zero', () => {
        const comments = commentsSeeded()
        expect(comments).to.have.property('count', 2)
        comments.clear()
        expect(comments).to.have.property('count', 0)
      })

      it('notifies subscribers', () => {
        const comments = commentsSeeded()
        let called = false
        comments.subscribe(() => { called = true })
        comments.clear()
        expect(called).to.be.equal(true)
      })

      it('doesn\'t notify subscribers if collection was already cleared', () => {
        const comments = new Comments()
        let called = false
        comments.subscribe(() => { called = true })
        comments.clear()
        expect(called).to.be.equal(false)
      })
    })

    describe('toJSON', () => {
      it('returns a plain object representation')
    })
  })
})

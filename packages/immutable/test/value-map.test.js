import { expect } from 'chai'
import { ValueMap, EQUALS } from '../src'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/******************************************************************************/
// Types
/******************************************************************************/

class CustomId {

  constructor (input = Math.random()) {

    this.id = input
    while (this.toString().length < 10)
      this.id += (Math.random() * 0.1)

    while (this.id > 1)
      this.id *= 0.1
  }

  [EQUALS] (b) {
    return typeof b === 'object' &&
      b !== null &&
      'id' in b &&
      b.id === this.id
  }

  toString () {
    return this.id.toString().replace('0.', '#')
  }

}

/******************************************************************************/
// Data
/******************************************************************************/

/* eslint-disable no-multi-spaces */
const pairs = [
  0,              'zero',
  1,              'one',
  -1,             'minus-one',
  Infinity,       'infinity',
  -Infinity,      'minus-infinity',
  '0',            'zero-string',
  '1',            'one-string',
  Symbol('id-1'), 'symbol-1',
  Symbol('id-2'), 'symbol-2',
  new CustomId(), 'custom-id-1',
  new CustomId(), 'custom-id-2'
]
/* eslint-enable */

/******************************************************************************/
// Helper
/******************************************************************************/

function forEachPair (func) {
  for (let i = 0; i < pairs.length; i += 2) {
    const key = pairs[i]
    const value = pairs[i + 1]
    func(key, value, i)
  }
}

/******************************************************************************/
// Tests
/******************************************************************************/

describe('ValueMap', () => {

  it('is a class', () => {
    expect(() => ValueMap()).to.throw('cannot be invoked without \'new\'')
  })

  let map

  beforeEach(() => {
    map = new ValueMap(...pairs)
  })

  describe('initializes with key-value pairs paremeters', () => {

    it('must be an even number of params', () => {
      expect(() => new ValueMap('some-id'))
        .to.throw('Must be an even number of arguments.')

      expect(() => new ValueMap(
        'string-id',
        { thing: 'Boo' }
      )).to.not.throw()

    })

    it('even properties must Ids', () => {

      expect(() => new ValueMap(
        'string-id', true
      )).to.not.throw()

      expect(() => new ValueMap(
        'this-counts-as-an-id', true
      )).to.not.throw()

      expect(() => new ValueMap(
        504129.11, true
      )).to.not.throw()

      expect(() => new ValueMap(
        Symbol('so does this'), true
      )).to.not.throw()

    })

    it('Constructed values are added to data', () => {
      const map = new ValueMap(
        '1', 1000,
        '2', 2000,
        '3', 3000,
        1, 4000,
        2, 5000,
        3, 6000,
        'oy-wtf-mate', 7000
      )

      const [ DATA ] = Object.getOwnPropertySymbols(map)

      const data = map[DATA]

      expect(data).to.have.property('length', 7)
      expect(data.length).to.equal(map.size)

    })

  })

  describe('Valid ids', () => {

    describe('Strings', () => {
      it('any', () => {
        expect(() => new ValueMap(
          'any ol string', true
        )).to.not.throw()
      })
    })

    describe('Symbols', () => {
      it('any', () => {
        expect(() => new ValueMap(
          Symbol('symbols'), true
        )).to.not.throw()
      })
    })

    describe('Custom Ids', () => {
      it('any', () => {
        expect(() => new ValueMap(
          new CustomId(), true
        )).to.not.throw()
      })
    })

    describe('Numbers', () => {

      it('finite numbers pass', () => {
        expect(() => new ValueMap(
          504129.11, true
        )).to.not.throw()
      })

      it('infinite numbers pass', () => {
        expect(() => new ValueMap(
          Infinity, true
        )).to.not.throw()

        expect(() => new ValueMap(
          -Infinity, true
        )).to.not.throw()
      })

      it('NaN passes', () => {
        expect(() => new ValueMap(
          NaN, true
        )).to.not.throw()
      })
    })
  })

  describe('Methods', () => {

    describe('#get', () => {

      describe('gets key values', () => {
        forEachPair((k, v) =>
          it(`gets ${k.toString()}: ${v}`, () => {
            expect(map.get(k)).to.equal(v)
          })
        )
      })

      describe('equivalent object ids pass', () => {
        forEachPair((k, v) => {
          if (typeof k !== 'object')
            return
          it(`gets copy of ${k.toString()}: ${v}`, () => {
            const ki = new k.constructor(k.id)
            expect(map.get(ki)).to.equal(v)
          })
        })
      })

      it('throws if id is not provided', () => {
        expect(() => map.get()).to.throw('undefined is not a valid id.')
      })

    })

    describe('#set', () => {

      describe('sets existing values', () => {
        forEachPair((k, v) => {
          it(`sets ${k.toString()} to true`, () => {
            map.set(k, true)
            return expect(map.get(k)).to.be.true
          })
        })
      })

      describe('equivalent object ids pass', () => {

        let size
        before(() => {
          size = map.size
        })

        forEachPair(k => {
          if (typeof k !== 'object')
            return
          it(`sets copy of ${k.toString()} to false`, () => {
            const ki = new k.constructor(k.id)
            map.set(ki, false)

            // Proves that setting a key copy didn't result in a new key being set
            expect(map.size).to.equal(size)

            return expect(map.get(ki)).to.be.false
          })
        })
      })

      describe('sets new values', () => {
        it('If key doesnt exists', () => {
          map.set(1000, 'one-thousand')
          expect(map.get(1000)).to.equal('one-thousand')
        })
      })

    })

    describe('#has', () => {

      describe('returns true if map has key', () => {
        forEachPair(k => {
          it(`has key ${k.toString()} : true`, () => {
            return expect(map.has(k)).to.be.true
          })
        })
      })

      describe('returns false if not', () => {
        [Symbol.iterator, 'woooo', -10231].forEach(k => {
          it(`has key ${k.toString()} : false`, () => {
            return expect(map.has(k)).to.be.false
          })
        })
      })

      describe('equivalent object ids work', () => {
        forEachPair(k => {
          if (typeof k !== 'object')
            return
          it(`sets copy of ${k.toString()} to false`, () => {
            const ki = new k.constructor(k.id)
            map.set(ki, false)
            return expect(map.has(ki)).to.be.true
          })
        })
      })

    })

    describe('#delete', () => {

      describe('removes item from map', () => {
        forEachPair(k => {
          it(`removes ${k.toString()}`, () => {
            expect(map.delete(k)).to.be.true // eslint-disable-line no-unused-expressions
            expect(map.has(k)).to.be.false // eslint-disable-line no-unused-expressions
          })
        })
      })

      describe('returns false if no item was removed', () => {
        it('remove -1000 returns false', () =>
          expect(map.delete(-1000)).to.be.false
        )
      })

      describe('equivalent object ids work', () => {
        forEachPair(k => {
          if (typeof k !== 'object')
            return
          it(`sets copy of ${k.toString()} to false`, () => {
            const ki = new k.constructor(k.id)
            return expect(map.delete(ki)).to.be.true
          })
        })
      })

    })

    describe('#clear', () => {

      it('removes all keys and values', () => {
        map.clear()
        expect(map.size).to.equal(0)
        const [ KEYS, VALUES ] = Object.getOwnPropertySymbols(map)

        expect(map[KEYS]).to.have.property('length', 0)
        expect(map[VALUES]).to.have.property('length', 0)
      })

    })

    describe('#forEach', () => {

      it('key and value come in first argument as array', () => {
        map.forEach(([k, v]) => {
          expect(map.has(k)).to.equal(true)
          expect(map.get(k)).to.equal(v)
        })
      })

      it('runs a function through each key value', () => {
        let length = 0
        map.forEach(([k, v]) => length++)
        expect(length).to.equal(map.size)
      })

      it('values arnt mutated from last set', () => {
        map.forEach(([k, v]) => {
          expect(pairs.includes(k)).to.equal(true)
          expect(pairs.includes(v)).to.equal(true)
        })
      })

      it('index as second argument', () => {
        let index = 0
        map.forEach((arr, i) => {
          expect(i).to.equal(index)
          index++
        })
      })

      it('map as third argument', () => {
        map.forEach((arr, i, m) => {
          expect(map).to.equal(m)
        })
      })

    })

    describe('#keys', () => {

      it('returns an iterable for all keys', () => {
        const keys = pairs.reduce((a, v, i) => i % 2 === 0 ? a.push(v) && a : a, [])
        expect(keys).to.deep.equal([...map.keys()])
      })

    })

    describe('#values', () => {
      it('returns an iterable for all values', () => {
        const keys = pairs.reduce((a, v, i) => i % 2 === 1 ? a.push(v) && a : a, [])
        expect(keys).to.deep.equal([...map.values()])
      })
    })

  })

  describe('Iterable', () => {

    it('for [key, value] of map', () => {
      expect(() => {
        for (const kv of map) break // eslint-disable-line no-unused-vars
      }).to.not.throw(Error)
    })

    it('iterates through each key value', () => {

      for (const [ key, value ] of map)
        expect(map.get(key)).to.equal(value)

      const kvs = [ ...map ]

      expect(kvs.length).to.equal(map.size)

    })

  })

  describe('Properties', () => {
    describe('@size', () => {
      it('returns number of keys', () => {
        expect(map.size).to.equal(pairs.length * 0.5)
      })
    })
  })
})

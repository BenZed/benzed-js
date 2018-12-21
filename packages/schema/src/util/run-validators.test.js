import { expect } from 'chai'

import runValidators from './run-validators'
import ValidationError from './validation-error'

import is from 'is-explicit'
import { milliseconds } from '@benzed/async'

// @jsx require('../create-validator').default
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('runValidators', () => {

  it('is a function', () => {
    expect(runValidators).to.be.instanceof(Function)
  })

  let Code
  let Article
  let Async
  before(() => {
    Code = <string key='code' length={['<=', 10]} required uppercase />

    // eslint-disable-next-line no-unused-vars
    const Score = <number range={[0, 5]} />

    Async = <string
      validate={value => is.string(value)
        ? milliseconds(10).then(() => value)
        : value
      }
    />

    Article = <object key='article' plain strict>

      <string key='author' required length={['<=', 50]}/>
      <string key='body' />

      <array key='scores' required length={['>', 0]}>

        <multi required>
          <Score />
          <Async />
          <object plain strict>
            <Score key='score' />
            <Async key='page-link' />
          </object>
        </multi>

      </array>
      <Async key='online-id' />
    </object>
  })

  it('schema errors get wrapped as validation errors', () => {
    expect(() => Code('i dont know what to do'))
      .to.throw(ValidationError)
  })

  describe('throwing validation errors', () => {

    it('is the path of the context where the error was thrown', () => {

      let err
      try {
        Code('123412341234123412341234')
      } catch (e) {
        err = e
      }

      expect(err.path)
        .to.be.deep
        .equal([Code.key])
    })

    it('handles promise results', async () => {
      const result = await Async('sam')
      expect(result).to.be.equal('sam')
    })

    // TODO this should probably be moved to object-type.test.js
    it('path of context is deep', () => {
      let err
      try {
        Article({})
      } catch (e) {
        err = e
      }

      expect(err.rawMessage)
        .to.be.equal('is required.')

      expect(err.value)
        .to.be.equal(undefined)

      expect(err.path)
        .to.be.deep
        .equal([ 'article', 'author' ])
    })

    // TODO this should probably be moved to object-type.test.js
    it('handles deep promise results', async () => {

      const article = await Article({
        author: 'James',
        'online-id': '100',
        scores: [ 0 ]
      })

      expect(article).to.be.deep.equal({
        author: 'James',
        'online-id': '100',
        scores: [ 0 ]
      })

    })

    it('async errors catch properly')

    // TODO this should probably be moved to array-type.test.js
    it('path of context is deep for arrays', () => {

      let err
      try {
        Article({
          author: 'Cheese',
          scores: [ null ]
        })
      } catch (e) {
        err = e
      }

      expect(err.rawMessage)
        .to.be.equal('is required.')

      expect(err.value)
        .to.be.equal(null)

      expect(err.path)
        .to.be.deep
        .equal([ 'article', 'scores', 0 ])
    })

    // TODO this should probably be moved to array-type.test.js
    it('handles promises in arrays', async () => {

      const article = await Article({
        author: 'Cheese',
        scores: [ 'link-to-score' ]
      })

      expect(article).to.be.deep.equal({
        'author': 'Cheese',
        'scores': [ 'link-to-score' ]
      })
    })

    it('array async errors catch properly')

    // TODO this should probably be moved to multi-type.test.js
    it('path of context is correct for multi-types', () => {

      let err
      try {
        Article({
          author: 'Cheese',
          scores: [ { score: 5 } ]
        })
      } catch (e) {
        err = e
      }

      expect(err.rawMessage)
        .to.include('must be between 0 and 5')

      expect(err.value)
        .to.be.deep
        .equal(5)

      expect(err.path)
        .to.be.deep
        .equal([ 'article', 'scores', 0, 'score' ])
    })

    it('multi-type async errors catch properly')
  })
})

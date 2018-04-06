import { expect } from 'chai'
import App from '../src'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('App', () => {

  it('is a class', () => {
    expect(App).to.throw('cannot be invoked without \'new\'')
  })

  describe('configuration', () => {

    it('Must take an object as config', () => {

      for (const badValue of [ 1, null, undefined, 'string', Symbol('symbol'), false, function () {} ])
        expect(() => new App(badValue)).to.throw('constructed with a config object')

      expect(() => new App({})).to.not.throw(Error)
    })

  })

})

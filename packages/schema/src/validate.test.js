import { expect } from 'chai'

import validate from './validate'

import { string } from './types'

import { Context, ValidationError } from './util'

import { expectReject } from '@benzed/dev'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('validate', () => {

  it('is a function', () => {
    expect(validate).to.be.instanceof(Function)
  })

  it('takes a validator, input and context', () => {
    expect(validate(string(), 'cool', new Context()))
      .to.equal('cool')
  })

  it('can take an array of validators, chaining output to input', () => {

    const double = value => value * 2

    expect(validate([double, double, double], 1, new Context()))
      .to.equal(8)

  })

  it('resolves promises before sending result to next validator', async () => {

    const repeat = arr => {
      arr.push(arr[arr.length - 1])
      return arr
    }

    const promiseRepeat = arr => Promise.resolve(repeat(arr))

    const result = await validate([
      repeat,
      promiseRepeat,
      repeat
    ], [1], new Context())

    expect(result).to.deep.equal([1, 1, 1, 1])

  })

  it('resolves promise input before sending to validator', async () => {

    const input = Promise.resolve('cool')

    const result = await validate(string(), input, new Context())

    expect(result).to.equal('cool')

  })

  it('wraps errors in ValidationError', () => {

    expect(() => validate(string(), Symbol('010'), new Context()))
      .to.throw(ValidationError)

  })

  it('wraps promise rejections in ValidationError', () => {

    const uFuckedUp = () => Promise.reject(new Error('You fucked up'))

    return validate(uFuckedUp, 0, new Context())::expectReject(ValidationError)

  })

})

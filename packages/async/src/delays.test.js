import { expect } from 'chai'
import { milliseconds, seconds, until } from './delays'
import { expectReject } from '@benzed/dev'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('milliseconds', () => {
  it('is a function', () => {
    expect(milliseconds).to.be.instanceof(Function)
  })
  it('returns a promise', () => {
    expect(milliseconds(0)).to.be.instanceof(Promise)
  })
  it('resolves after a set number of milliseconds', async () => {
    const start = Date.now()
    await milliseconds(15)
    expect(Date.now() - start >= 15).to.be.equal(true)
  })
  it('returns number of milliseconds waited', async () => {
    expect(await milliseconds(5)).to.be.equal(5)
  })
})

describe('seconds', () => {
  it('is a function', () => {
    expect(seconds).to.be.instanceof(Function)
  })
  it('returns a promise', () => {
    expect(seconds(0)).to.be.instanceof(Promise)
  })
  it('resolves after a set number of seconds', async () => {
    const start = Date.now()
    await seconds(0.015)
    expect(Date.now() - start >= 15).to.be.equal(true)
  })
  it('returns number of milliseconds waited', async () => {
    expect(await seconds(0.025)).to.be.equal(25)
  })
})

describe('until', () => {
  it('is a function', () => {
    expect(until).to.be.instanceof(Function)
  })

  describe('config', () => {

    describe('condition function', () => {
      it('casts function to config', () => {
        expect(() => until(() => true)).to.not.throw(Error)
      })
      it('determines when while loop closes', async () => {
        let i = 0
        const ms = await until(() => ++i > 1)
        expect(i).to.be.equal(2)
        expect(ms >= 25).to.be.equal(true)
      })
      it('is required', () => {
        return until()::expectReject('condition must be a function')
      })
      it('takes delta ms as argument', async () => {
        let _delta = 0
        await until(delta => { _delta = delta; return _delta >= 25 })

        expect(_delta >= 25).to.be.equal(true)
      })
    })

    describe('timeout', () => {
      it('maximum time, in milliseconds, while loop can run', () => {
        return until({
          condition: () => false,
          timeout: 20,
          interval: 1
        })::expectReject('condition could not be met in 20 ms')
      })
      it('defaults to infinity', () => {
        // lol
        const fs = require('fs')
        const path = require('path')
        const str = fs.readFileSync(path.join(__dirname, 'delays.js'))

        expect(str.toString()).to.include('timeout = Infinity')
      })
    })

    describe('interval', () => {
      it('condition is checked every <interval> ms', async () => {
        let i = 0
        const ms = await until({
          condition: () => i++ === 3,
          interval: 5
        })

        expect(ms >= 15 && ms < 20).to.be.equal(true)
      })
      it('defaults to 25', async () => {
        let _switch = true
        const ms = await until(() => { _switch = !_switch; return _switch })

        expect(ms >= 25 && ms < 50).to.be.equal(true)
      })
    })

    describe('err', () => {
      it('message to throw in error if while loop times out', () => {
        return until({
          condition: () => false,
          interval: 1,
          timeout: 10,
          err: 'if it cannot be done in 10 milliseconds, it cannot be done'
        })::expectReject('if it cannot be done in 10 milliseconds, it cannot be done')
      })
      it('defaults to \'condition could not be met in <timeout> ms\'', () => {
        return until({
          condition: () => false,
          interval: 1,
          timeout: 10
        })::expectReject('condition could not be met in 10 ms')
      })
    })
  })

  it('returns number of milliseconds waiting took', async () => {
    const ms = await until({
      condition: delta => delta > 10,
      interval: 1
    })

    expect(ms > 10).to.be.equal(true)
  })
})

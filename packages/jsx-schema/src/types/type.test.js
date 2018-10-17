import { createValidator } from '../' // eslint-disable-line no-unused-vars
import { SCHEMA } from '../create-validator'

import { expect } from 'chai'
import Type from './type'

import is from 'is-explicit'

import { reverse } from '@benzed/immutable'

// @jsx createValidator
/* eslint-disable react/react-in-jsx-scope */

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('Type', () => {

  it('is a class', () => {
    expect(() => Type())
      .to
      .throw('cannot be invoked without \'new\'')
  })

  it('most basic type, used for \'any\'', () => {
    expect(<any/>[SCHEMA]
      .type
      .constructor
    ).to.be.equal(Type)
  })

  describe('validators', () => {

    describe('required', () => {

      let noNullOrUndefined
      before(() => {
        noNullOrUndefined = <any required />
      })

      it('throws if value isn\'t defined', () => {
        for (const nil of [ null, undefined ])
          expect(() => noNullOrUndefined(nil))
            .to.throw('is required.')
      })

      it('any other value is fine', () => {
        for (const value of [ true, false, 0, '', {} ])
          expect(noNullOrUndefined(value))
            .to.be.equal(value)
      })

      it('customizable error message', () => {
        const moron = <any required='You are a moron.' />
        expect(() => moron(null))
          .to.throw('You are a moron.')
      })

      it('returns updated prop', () => {
        const sup = <any required='sup' />
        expect(sup.props.required).to.be.deep.equal({ err: 'sup' })
      })

    })

    describe('validate', () => {

      it('allows arbitrary an function to be used as a validator', () => {

        const square = v => is.number(v) ? v * v : v

        const foo = <any validate={square} />

        expect(foo(4)).to.be.equal(4 * 4)
        expect(foo('foo')).to.be.equal('foo')

      })

      it('can also take an array of functions', () => {

        const backwards = value => is.array(value)
          ? value::reverse()
          : value

        const join = value => is.array(value)
          ? value.join('')
          : value

        const noBar = value => value === 'bar'
          ? throw new Error('BAR IS NOT ALLOWED')
          : value

        const foo = <any validate={[
          backwards,
          join,
          noBar
        ]} />

        expect(foo([ ...'dear' ]))
          .to.be.equal('raed')

        expect(() => foo([ ...'rab' ]))
          .to.throw('BAR IS NOT ALLOWED')

      })

      it('throws if it does not receive functions', () => {
        expect(() => <any validate />).to.throw('takes a validator function')
      })
    })

    describe('default', () => {

      it('sets default value', () => {

        const foo = <any default='bar' />

        for (const nil of [ null, undefined ])
          expect(foo(nil))
            .to.be.equal('bar')
      })

      it('does nothing if value is defined', () => {
        const foo = <any default='bar' />

        expect(foo(1000))
          .to.be.equal(1000)
      })

      it('order matters', () => {
        expect(() => <any
          required
          default
        />())
          .to.throw('is required.')

        expect(<any
          default
          required
        />())
          .to.be.equal(true)
      })

      it('provided function gets called', () => {
        const rando = <any default={Math.random} />
        expect(typeof rando()).to.be.equal('number')
      })

      it('provided function receives validation context')
    })

    describe('range', () => {

      it('throws if value does not satisfy declared range', () => {
        const below5 = <any range={['<', 5]} />
        expect(() => below5(5))
          .to.throw('must be less than 5')
      })

      it('ignores null and undefined', () => {
        for (const nil of [ null, undefined ])
          expect(() => (<any range={[0, 5]} />)(nil))
            .to.not.throw()
      })

      it('uses valueOf for non-numeric inputs', () => {

        const ben = {
          rank: 'genuis',
          valueOf () {
            return 1000
          }
        }

        expect(() => <any range={['<=', 10, 'Gotta be small.']} />(ben))
          .to.throw('Gotta be small.')

        expect((<any range={[500, 10000]} />)(ben))
          .to.be.equal(ben)

      })

      it('throws if value does not have a numeric valueOf', () => {
        const between1and10 = <any range={[0, 10]} />

        expect(() => between1and10('sup'))
          .to.throw('cannot compare range with non-numeric value')
      })
    })

    describe('length', () => {

      it('throws if value length does not satisfy declared range', () => {

        const code = <any length={['>=', 3]} />

        expect(() => code('yo'))
          .to.throw('length must be equal to or greater than 3')

      })

      it('throws if value does not have a numeric legnth', () => {

        const novel = { length: 501 }
        const short = { length: 10 }

        const book = <any length={['>', 500, 'must have more than 500 pages']} />

        expect(() => book(501))
          .to.throw('value does not have a numeric length')
        expect(book(novel))
          .to.be.equal(novel)
        expect(() => book(short))
          .to.throw('must have more than 500 pages')
      })

      it('ignores null and undefined', () => {
        for (const nil of [ null, undefined ])
          expect(<any length={[0, 10]} />(nil))
            .to.be.equal(nil)
      })

      it('sets props.length with config', () => {
        expect(<any length={[0, 10]}/>.props.length)
          .to.have.property('max', 10)
      })

      it('throws if min, max or value is below 0', () => {

        for (const badLength of [
          [ '<=', -1 ],
          { max: -10, min: -100 },
          [ '==', -5 ]
        ])
          expect(() => <any length={badLength} />)
            .to.throw('must be above 0')

      })
    })

  })
})

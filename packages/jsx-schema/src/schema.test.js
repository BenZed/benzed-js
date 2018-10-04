import { expect } from 'chai'
import Schema from './schema'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

/* eslint-disable react/react-in-jsx-scope */
// @jsx Schema.create

describe('Schema', () => {

  it('is a class', () => {
    expect(() => Schema()).to.throw('invoked without \'new\'')
  })

  describe('class methods', () => {

    describe('Schema.create', () => {
      it('is an alias for new Schema', () => {
        const schema = Schema.create(String, {}, null)
        expect(schema).to.be.instanceof(Schema)
      })

      it('works with jsx', () => {
        const schema = <string />
        expect(schema).to.be.instanceof(Schema)
      })
    })

  })

  describe('instance methods', () => {

    describe('validate', () => {

      describe('simple examples', () => {

        it('<string/> validates strings', () => {
          expect(<string/>.validate('hello'))
            .to.be.equal('hello')
        })

        it('<string/> allows null or undefined', () => {

          for (const nil of [null, undefined])
            expect(<string/>.validate(nil))
              .to.be.equal(nil)
        })

        it('<string required /> does not allow null or undefined', () => {

          for (const nil of [null, undefined])
            expect(() => <string required />.validate(nil))
              .to.throw('is required.')
        })

        it('<string /> does not allow non string data', () => {
          expect(() => <string/>.validate(100))
            .to.throw('must be of type: String')
        })

        it('<bool/> or <boolean/> validates bools', () => {
          expect(() => <bool/>.validate(50))
            .to.throw('must be of type: Boolean')

          expect(<boolean/>.validate(false))
            .to.be.equal(false)
        })

        it('<number/> ')

      })

      // it('throws error if data is invalid', () => {
      //   expect(() => Email.validate(100))
      //     .to.throw('must be a String.')
      // })
    })
  })

})

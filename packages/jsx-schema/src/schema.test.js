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

    describe('Schema.resolveTypeValidator', () => {
      it('returns a type constructor used by a type')
    })

    describe('Schema.resolveValidator', () => {
      it('returns a valiadtor function')
    })

  })

  describe('instance methods', () => {

    describe('validate', () => {

      let BasicString
      let Email

      before(() => {

        BasicString = <string />

        Email = <string
          format={/(\w|\d)+@\w+\..+/}
          required
          length={['>', 0]}
        />

        const Person = <object>
          <BasicString key='name' />
          <Email key='personal-email' required={false} />
        </object>

        const Employee = <Person>
          {Person.children}
          <Email key='work-email' />
        </Person>

        console.log(Employee)

      })

      it('validates data', () => {
        expect(BasicString.validate('hello'))
          .to.be.equal('hello')
      })

      it('throws error if data is invalid', () => {
        expect(() => Email.validate(100))
          .to.throw('must be a String.')
      })

    })
  })
})

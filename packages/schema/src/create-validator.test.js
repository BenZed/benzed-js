import 'colors'
import is from 'is-explicit'
import { expect } from 'chai'

import createValidator, { $$schema } from './create-validator'
import { ValidationError } from './util'

/* eslint-disable react/react-in-jsx-scope, react/prop-types */ // @jsx createValidator

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('createValidator', () => {

  it('should return a function', () => {
    const validator = createValidator('string', { uppercase: true })
    const validator2 = <string uppercase />

    expect(validator).to.be.instanceof(Function)
    expect(validator2).to.be.instanceof(Function)
  })

  describe('returned function', () => {

    it('should have symbolic Schema property', () => {
      const validator = <string />
      expect(validator).to.have.property($$schema)
    })

    it('should have schema shortcuts', () => {
      const validator = <string />

      expect(validator).to.have.deep.property('props', { children: null })
      expect(validator).to.have.property('type', String)
    })

    it('should validate data', () => {
      const upper = <string uppercase />

      expect(() => upper(100)).to.throw(ValidationError)
    })

    it('sorts validators by priority')
  })

  it('can nest existing validators', () => {
    // eslint-disable-next-line no-unused-vars
    const Code = <string uppercase length={['>', 0]}/>
    const id = <Code length={9} />

    expect(id).to.have.property('props')
    expect(id.props).to.have.property('uppercase', true)
    expect(id.props.length).to.have.property('value', 9)
    expect(id.type).to.be.equal(String)
  })

  it('nesting validators doesn\'t overwrite children', () => {
    // eslint-disable-next-line no-unused-vars
    const Vector = <object strict>
      <number key='x' required />
      <number key='y' required />
    </object>

    let Coords
    expect(() => {
      Coords = <object strict>
        <Vector key='position' />
        <Vector key='scale' default={{ x: 1, y: 1 }} />
      </object>
    }).to.not.throw(Error)

    expect(Coords({
      position: { x: 100, y: 100 }
    })).to.be.deep.equal({
      position: { x: 100, y: 100 },
      scale: { x: 1, y: 1 }
    })

  })

  it('can use custom compilers', () => {
    // eslint-disable-next-line no-unused-vars
    const Multiply = props =>
      value => is.number(value)
        ? value * props.by
        : value

    const double = <Multiply by={2} />
    const triple = <Multiply by={3} />

    expect(double(4)).to.be.equal(8)
    expect(triple(3)).to.be.equal(9)

    expect(double).to.have.property($$schema)
  })

  describe('examples', () => {

    describe(`const Person = <object plain >
        <string key='name' />
        <number key='age' range={['>', 0]}/>
      </object>`.magenta, () => {

      let Person
      before(() => {
        Person = <object plain >
          <string key='name' />
          <number key='age' range={['>', 0]}/>
        </object>
      })

      it('not required', () => {
        expect(Person())
          .to.be.equal(undefined)
        expect(Person(null))
          .to.be.equal(null)
      })

      describe(`Employee = <Person required>
          {Person.props.children}
          <string key='code' length={3} required />
        </Person>`.magenta, () => {

        let Employee
        before(() => {
          Employee = <Person required>
            {Person.props.children}
            <string key='code' length={3} required />
          </Person>
        })

        it('is required', () => {
          expect(() => Employee(null)).to.throw('is required.')
        })

        it('extends properly', () => {
          const charles = {
            name: 'Charles',
            code: 'ACA',
            age: 29
          }

          expect(() => Employee(charles)).to.not.throw()
          expect(Employee(charles)).to.be.deep.equal(charles)
          expect(() => Employee({
            name: 'Amber',
            age: 30
          })).to.throw()
        })
      })
    })
  })
})

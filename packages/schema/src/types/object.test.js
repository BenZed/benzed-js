import { expect } from 'chai'

import { object, string, number, bool, oneOf } from '../types'
import { cast, required, length } from '../validators'

import ValidationError from '../util/validation-error'
import Context from '../util/context'

// import { defaultTo, required } from '../validators'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('object()', () => {

  let person
  before(() => {
    const nameToPerson = name => typeof name === 'string'
      ? { name, age: 0 }
      : name

    const ageToPerson = age => typeof age === 'number'
      ? { name: 'Jane Doe', age }
      : age

    person = object(
      {
        name: string,
        age: number
      },
      cast(nameToPerson, ageToPerson)
    )
  })

  it('returns an error if an input is not an object', () => {
    expect(person(true))
      .to.have.property('message', 'Must be an Object')
  })

  it('returns value otherwise', () => {
    expect(person({ age: 30, name: 'Ben' }))
      .to.deep.equal({ age: 30, name: 'Ben' })
  })

  it('null and undefined are ignored', () => {

    expect(person(null))
      .to.be.equal(null)

    expect(person(undefined))
      .to.be.equal(undefined)
  })

  describe('it takes a config', () => {
    it('err string', () => {

      const errObject = object('Objects only')

      expect(errObject('string'))
        .to.have.property('message', 'Objects only')
    })

    it('cast function', () => {
      expect(person('infant'))
        .to.deep.equal({ age: 0, name: 'infant' })

      expect(person(100))
        .to.deep.equal({ age: 100, name: 'Jane Doe' })
    })

    it('shape object', () => {
      const shaped = object({
        shape: {
          code: string,
          priority: number
        }
      })

      const result = shaped({ code: '1000', priority: 1000 })

      expect(result).to.deep.equal({ code: '1000', priority: 1000 })
    })

    it('shapeKeysOnly bool', () => {

      const restrictedShape = object({
        shape: {
          foo: string
        },
        shapeKeysOnly: true
      })

      const unrestrictedShape = object({
        shape: {
          foo: string
        },
        shapeKeysOnly: false
      })

      const restricted = restrictedShape({ foo: 'bar', bar: 'foo' })
      expect(restricted).to.deep.equal({ foo: 'bar' })

      const unrestricted = unrestrictedShape({ foo: 'bar', bar: 'foo' })
      expect(unrestricted).to.deep.equal({ foo: 'bar', bar: 'foo' })

    })

    it('validator functions', () => {

      const old = person => person.age < 65
        ? new Error('retirees only')
        : person

      const oldPerson = object(person, old)

      const oldResult = oldPerson({
        name: 'Bill',
        age: 67
      })

      expect(oldResult).to.deep.equal({
        name: 'Bill',
        age: 67
      })

      const youngResult = oldPerson({
        name: 'Ben',
        age: 30
      })

      expect(youngResult).to.have.property('message', 'retirees only')
    })
  })

  describe('error behaviour', () => {

    let obj, context
    before(() => {
      obj = object({
        name: string(required),
        age: number(required),
        meta: {
          code: string(required, length('<=', 3)),
          direction: oneOf(['n', 'w', 'e', 's']),
          urgent: bool(
            required,
            (value, ctx) =>
              value && (!ctx.data.meta || ctx.data.meta.code !== 'ace')
                ? new Error('can only be true if meta.code is set to \'ace\'')
                : value
          )
        }
      }, false)
      context = new Context().safe()
    })

    it('appends keys to context path', () => {

      const err = obj({
        name: undefined
      }, context)

      expect(err).to.be.instanceof(ValidationError)
      expect(err).to.have.property('message', 'name is Required.')
      expect(err).to.have.deep.property('path', ['name'])
      expect(err).to.have.property('rawMessage', 'is Required.')
    })

    it('on deep paths', () => {

      const err = obj({
        name: 'Ben',
        age: 33,
        meta: {
          code: 'ace',
          direction: '??'
        }
      }, context)

      expect(err).to.be.instanceof(ValidationError)
      expect(err).to.have.property('message', 'meta.direction Must be one of: n, w, e, s')
      expect(err).to.have.deep.property('path', ['meta', 'direction'])
      expect(err).to.have.property('rawMessage', 'Must be one of: n, w, e, s')

    })

    it('on deep paths with custom validators', () => {
      const data = {
        name: 'Ben',
        age: 33,
        meta: {
          code: 'ret',
          direction: 'n',
          urgent: true
        }
      }

      const context = new Context(data).safe()

      const err = obj(data, context)

      expect(err).to.be.instanceof(ValidationError)
      expect(err).to.have.property('message', 'meta.urgent can only be true if meta.code is set to \'ace\'')
      expect(err).to.have.deep.property('path', ['meta', 'urgent'])
      expect(err).to.have.property('rawMessage', 'can only be true if meta.code is set to \'ace\'')
    })

  })
})

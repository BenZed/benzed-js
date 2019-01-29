import { expect } from 'chai'
import action from './action'
import state from './state'
import StateTree from '../state-tree'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe('@action decorator', () => {

  it('is a function', () => {
    expect(typeof action).to.be.equal('function')
  })

  it('exists in StateTree.decorators', () => {
    expect(StateTree.decorators[action.name]).to.be.equal(action)
  })

  it('may only decorate state-tree properties', () => {

    expect(() => class {
      @action
      setFoo = foo => foo
    }).to.throw(
      '@action decorator can only decorate methods on classes ' +
      'extended from StateTree'
    )

    expect(() => class Bar extends StateTree {

      @action
      setFoo = foo => foo

    }).to.not.throw(Error)

  })

  it('may only decorate methods', () => {
    expect(() => class Bar extends StateTree {
      @action
      foo = 'bar'
    }).to.throw('@action decorator can only decorate methods')
  })

  describe('usage in extended StateTree instances', () => {

    let User
    before(() => {
      User = class User extends StateTree {

        @state
        name = ''

        @state
        age = NaN

        @state
        email = ''

        @action
        setInfo = settings => settings

        @action()
        setInfoV2 = settings => settings

        @action('age')
        changeAge (delta) {
          return this.age + delta
        }

        @action('email')
        fetchEmail = () =>
          Promise.resolve(
            this.name.toLowerCase() + '@email.com'
          )

        @action('age')
        changeAgeV2 = delta => this.age + delta

        constructor (name, age, email) {
          super()
          this.setInfo({ name, age, email })
        }

      }

    })

    it('allows state to be changed', () => {
      const user = new User('Ben', 33, 'ben@email.com')

      expect(user.name).to.be.equal('Ben')
      expect(user.age).to.be.equal(33)
      expect(user.email).to.be.equal('ben@email.com')
    })

    it('call decorator with path to only effect state at that path', () => {
      const user = new User('Toddler', 1)

      user.changeAge(5)

      expect(user.age).to.be.equal(6)
    })

    it('actions decorated with property initializer syntax get correct (this) scope', () => {

      const user = new User('Teenager', 20)
      user.changeAgeV2(-3)

      expect(user.age).to.be.equal(17)

    })

    it('@action() === @action (effects entire state)', () => {
      const user = new User('Ol Jake', 90, 'jake@aol.com')
      user.setInfoV2({ name: 'Old Jake', age: 89, email: 'jake@yahoo.com' })

      expect(user.name).to.be.equal('Old Jake')
      expect(user.age).to.be.equal(89)
      expect(user.email).to.be.equal('jake@yahoo.com')
    })

    it('actions are optionally asyncronous', async () => {

      const user = new User('Kaitlin', 23)
      await user.fetchEmail()

      expect(user.email).to.be.equal('kaitlin@email.com')
    })

    it('actions can only set state keys that already exist', () => {
      expect(() => class extends StateTree {

        @state
        foo = 'bar'

        @action('bar')
        setBar = value => value

      }).to.throw('action setBar cannot scope itself to \'bar\'')

      const user = new User()
      expect(() => user.setInfo({ password: 'password' }))
        .to.throw('action setInfo returned state with invalid key: \'password\'')
    })

    it('unscoped actions must return a plain object', () => {
      const user = new User()
      expect(() => user.setInfo(null))
        .to.throw('must return a full state')
    })

  })

})

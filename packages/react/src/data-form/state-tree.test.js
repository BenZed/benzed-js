import { expect } from 'chai'
import FormStateTree from './state-tree'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe.only('StateTree', () => {

  it('is a state tree', () => {
    const form = new FormStateTree({
      original: {}
    })

    expect(Object
      .getOwnPropertySymbols(form)
      .map(sym => sym.toString())
      .join(' ')
    ).to.include('state')
  })

  describe('edit()', () => {

    it('tracks changes to a supplied object immutably', () => {

      const form = new FormStateTree({
        original: {
          name: 'Wolf',
          age: 0
        }
      })

      form.edit('age', 40)
      form.edit('name', 'Wolfgang')

      expect(form.current).to.be.deep.equal({
        name: 'Wolfgang',
        age: 40
      })

    })

  })

  describe('push', () => {

    it('applies current changes to history', () => {

      const original = {
        name: 'Solemn Bob',
        age: 33,
        gender: 'male'
      }

      const form = new FormStateTree({
        original
      })

      form.edit('age', 44)
      form.edit('name', 'Robert')

      expect(form.history).to.have.length(0)

      form.push()
      expect(form.history).to.be.deep.equal([ original ])

    })

    it('history is only updated if updates actually change something', () => {

      const form = new FormStateTree({
        original: {
          room: '1a',
          floor: 1
        }
      })

      form.edit('room', '1a')
      form.edit('floor', 1)

      expect(form.history).to.have.length(0)

    })
  })

})

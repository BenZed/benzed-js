import { expect } from 'chai'
import FormStateTree from './form-state-tree'
import UiStateTree from '../app/state-tree/ui-state-tree'

import { last, first } from '@benzed/array'
import { serialize } from '@benzed/immutable'

import { createMemoryHistory } from 'history'

// eslint-disable-next-line no-unused-vars
/* global describe it before after beforeEach afterEach */

describe.only('FormStateTree', () => {

  it('is a state tree', () => {
    const form = new FormStateTree({
      data: {},
      submit () {}
    })

    expect(Object
      .getOwnPropertySymbols(form)
      .map(sym => sym.toString())
      .join(' ')
    ).to.include('state')
  })

  describe('editCurrent()', () => {

    let form
    before(() => {

      form = new FormStateTree({
        data: {
          name: 'Wolf',
          age: 0
        },
        submit () {}
      })

      form.editCurrent('age', 40)
      form.editCurrent('name', 'Wolfgang')
    })

    it('makes changes to state.current', () => {

      expect(form.current).to.be.deep.equal({
        name: 'Wolfgang',
        age: 40
      })

    })

    it('changes are immutable', () => {

      const { current } = form
      form.editCurrent('age', 39)

      expect(current).to.not.equal(form.current)
    })

    it('path is required', () => {
      expect(() => form.editCurrent()).to.throw('path is required')
    })

    it('value is required', () => {
      expect(() => form.editCurrent('age')).to.throw('value is required')
    })

    it('if supplied value is a function, executes function with existing value at path', () => {
      let _ageInFunc
      const _ageInState = form.current.age

      form.editCurrent('age', age => {
        _ageInFunc = age
        return age + 1
      })

      expect(_ageInFunc).to.be.equal(_ageInState)
      expect(form.current.age).to.be.equal(_ageInState + 1)
    })

  })

  describe('pushCurrent()', () => {

    it('applies current changes to form history', () => {

      const data = {
        name: 'Solemn Bob',
        age: 33,
        gender: 'male'
      }

      const form = new FormStateTree({
        data,
        submit () {}
      })

      form.editCurrent('age', 44)
      form.editCurrent('name', 'Robert')

      expect(form.history).to.be.deep.equal([ data ])

      const { current } = form

      form.pushCurrent()
      expect(form.history).to.be.deep.equal([ data, current ])

    })

    it('history is only updated if pushing actually change something', () => {

      const data = {
        room: '1a',
        floor: 1
      }

      const form = new FormStateTree({
        data,
        submit () {}
      })

      expect(form.history).to.be.deep.equal([ data ])

      form.editCurrent('room', '1a')
      form.editCurrent('floor', 1)
      form.pushCurrent()
      expect(form.history).to.be.deep.equal([ data ])

      form.editCurrent('room', '1b')
      const { current } = form
      form.pushCurrent()
      expect(form.history).to.be.deep.equal([ data, current ])

    })

    it('applies maxHistoryCount from config if history is too long', () => {

      const form = new FormStateTree({
        historyMaxCount: 5,
        data: {
          thisIsTotallyACake: true,
          slices: 1
        },
        submit () {}
      })

      for (let i = 0; i < 10; i++) {
        form.editCurrent('slices', form.current.slices * 2)
        form.pushCurrent()
      }

      expect(form.history).to.have.length(5)
    })

    it('truncates history if pushed while history.index is not final', () => {

      const form = new FormStateTree({
        data: {
          bottlesOfBeerOnTheWall: 100
        },
        submit () {}
      })

      const takeOneDownPassItAround = () => {
        form.editCurrent(
          'bottlesOfBeerOnTheWall',
          form.current.bottlesOfBeerOnTheWall - 1
        )
        form.pushCurrent()
      }

      while (form.current.bottlesOfBeerOnTheWall > 0)
        takeOneDownPassItAround()

      const targetIndex = form.history.length - 5
      form.applyHistoryToCurrent(targetIndex)
      form.pushCurrent()

      expect(form.history).to.have.length(targetIndex + 1)

    })

  })

  const makeAFormWithHistory = () => {
    const form = new FormStateTree({
      data: {
        ghostsBusted: 0,
        ghostsBusters: 4,
        budget: 1200
      },
      submit () {}
    })

    form.editCurrent('ghostsBusted', busted => busted + 1)
    form.editCurrent('budget', budget => budget - 100)
    form.pushCurrent()

    form.editCurrent('ghostsBusted', busted => busted + 1)
    form.editCurrent('budget', budget => budget - 400)
    form.pushCurrent()

    form.editCurrent('ghostsBusted', busted => busted + 1)
    form.editCurrent('ghostsBusters', busters => busters - 1)
    form.editCurrent('budget', budget => budget - 600)
    form.pushCurrent()

    form.editCurrent('budget', budget => budget + 4000)
    form.pushCurrent()

    return form
  }

  describe('applyHistoryToCurrent()', () => {

    it('changes current to a value in history with a given index', () => {
      const form = makeAFormWithHistory()

      expect(form.current).to.be.deep.equal(last(form.history))

      form.applyHistoryToCurrent(2)
      expect(form.current).to.be.deep.equal(form.history[2])

    })

    it('clamps delta to first and last history', () => {
      const form = makeAFormWithHistory()
      form.applyHistoryToCurrent(-1000)

      expect(form.current).to.be.deep.equal(first(form.history))

      form.applyHistoryToCurrent(1000)
      expect(form.current).to.be.deep.equal(last(form.history))
    })

    it('change is immutable', () => {
      const form = makeAFormWithHistory()

      form.applyHistoryToCurrent(2)

      const second = form.history[2]

      expect(form.current).to.be.deep.equal(second)
      expect(form.current).to.not.be.equal(second)
    })

  })

  describe('undoEditCurrent()', () => {
    it('alias for applyHistoryToCurrent(-1)', () => {
      const form = makeAFormWithHistory()
      form.undoEditCurrent()
      expect(form.current).to.be.deep.equal(form.history[form.history.length - 2])
    })
    it('undoing at historyIndex === 0 does nothing', () => {
      const form = makeAFormWithHistory()
      expect(form.canUndoEditCurrent).to.be.equal(true)

      form.applyHistoryToCurrent(0)
      expect(form.current).to.be.deep.equal(first(form.history))
      expect(form.historyIndex).to.be.equal(0)
      expect(form.canUndoEditCurrent).to.be.equal(false)
    })
  })

  describe('redoEditCurrent()', () => {
    it('alias for applyHistoryToCurrent(1)', () => {
      const form = makeAFormWithHistory()
      expect(form.canRedoEditCurrent).to.be.equal(false)

      form.undoEditCurrent()
      expect(form.current).to.be.deep.equal(form.history[form.history.length - 2])
      expect(form.canRedoEditCurrent).to.be.equal(true)

      form.redoEditCurrent()
      expect(form.current).to.be.deep.equal(last(form.history))
    })
  })

  describe('using setUpstream()', () => {

    class Client {

      name = ''
      investment = 0

      constructor (name, investment) {
        this.name = name
        this.investment = 0
      }

      toJSON () {
        const { name, investment } = this
        return { name, investment }
      }

    }

    const prepare = () => {

      const client = new Client('Bruce Wayne', 2500000)

      async function save (current) {
        const { name, investment } = current
        await ui.fetch(name, investment)
      }

      const form = new FormStateTree({
        data: client.toJSON(),
        submit: save
      })

      const ui = {

        client,

        form,

        async fetch (name = this.client.name, investment = this.client.investment) {
          const update = await Promise.resolve({ name, investment })

          this.client.name = update.name
          this.client.investment = update.investment

          this.form.setUpstream(this.client)
        }
      }

      return ui
    }

    it('use setUpstream to match upstream data to remote objects', async () => {
      const ui = prepare()
      expect(ui.form.current).to.be.deep.equal(serialize(ui.client))

      await ui.fetch('Batman')
      expect(ui.form.current.name).to.not.be.deep.equal(ui.client.name)
      expect(ui.form.upstream.name).to.be.equal(ui.client.name)
      expect(ui.form.hasChangesToUpstream).to.be.equal(true)
      expect(ui.form.hasChangesToCurrent).to.be.equal(false)
    })

    it('use revertToUpstream to sync data and current to upstream', async () => {
      const ui = prepare()
      expect(ui.form.current).to.be.deep.equal(serialize(ui.client))

      await ui.fetch('Batman')
      ui.form.revertToUpstream()
      expect(ui.form.current).to.be.deep.equal(ui.form.upstream)
    })

    it('use pushUpstream when overwriting remote objects', async () => {
      const ui = prepare()
      expect(ui.form.current).to.be.deep.equal(serialize(ui.client))

      await ui.fetch('Batman')
      expect(ui.form.hasChangesToUpstream).to.be.equal(true)
      await ui.form.pushUpstream()
      expect(ui.form.hasChangesToUpstream).to.be.equal(false)
    })
  })

  describe('providing ui and historyStorageKey', () => {

    it('saves history to session storage', () => {
      const ui = new UiStateTree({
        history: createMemoryHistory()
      })

      const data = { foo: 'foo' }

      const form = new FormStateTree({
        ui,
        historyStorageKey: 'foo-bar',
        data,
        submit () {}
      })

      form.editCurrent('foo', 'bar')
      expect(ui.session.getItem('foo-bar')).to.be.deep.equal({
        current: { foo: 'bar' },
        history: [ data ],
        historyIndex: 0
      })

      form.pushCurrent()
      expect(ui.session.getItem('foo-bar')).to.be.deep.equal({
        current: { foo: 'bar' },
        history: [ data, { foo: 'bar' } ],
        historyIndex: 1
      })

    })

    it('auto populates with stored value', () => {
      const ui = new UiStateTree({
        history: createMemoryHistory()
      })

      ui.session.setItem('test-history', {
        current: { cake: 'wheeze' },
        historyIndex: 0,
        history: [ { cake: 'town' } ]
      })

      const form = new FormStateTree({
        historyStorageKey: 'test-history',
        data: { cake: 'bake' },
        ui,
        submit () {}
      })

      expect(form.current).to.be.deep.equal({ cake: 'wheeze' })
      expect(form.history).to.be.deep.equal([ { cake: 'town' } ])

    })

    it('ui is required if provided historyStorageKey', () => {
      expect(() => new FormStateTree({
        historyStorageKey: 'foo-bar',
        data: { cake: 'town' }
      }))
        .to.throw('requires ui to be provided')
    })

    it('history is applied on all forms using the same storage key', () => {

      const config = {
        data: { name: 'Jerry', age: 22 },
        historyStorageKey: 'jerry',
        ui: new UiStateTree({
          history: createMemoryHistory()
        }),
        submit () {}
      }

      const form1 = new FormStateTree(config)
      const form2 = new FormStateTree(config)

      form1.editCurrent('age', 23)
      expect(form2.current).to.be.deep.equal(form1.current)
    })
  })
})

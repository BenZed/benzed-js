import StateTree from '../state-tree'
import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars

import { equals, set, get, copy, serialize } from '@benzed/immutable'
import { last } from '@benzed/array'
import { clamp, min } from '@benzed/math'
import is from 'is-explicit'

/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Helper
/******************************************************************************/

const { defineProperties, freeze } = Object

function pushToSessionStorage (state = this) {

  const form = this
  const { historyStorageKey, ui } = form.config

  const { history, historyIndex, current } = state

  ui.session.setItem(historyStorageKey, { history, historyIndex, current })

}

function applyFromSessionStorage () {

  const form = this
  const { historyStorageKey, ui } = form.config

  const { history, historyIndex, current } = ui.session.getItem(historyStorageKey) || {}
  if (![history, historyIndex, current].every(is.defined))
    return

  const [ state, setState ] = form()
  setState(state::copy(state => {
    state.history = history
    state.current = current
    state.historyIndex = historyIndex
  }))
}

/******************************************************************************/
// Validation
/******************************************************************************/

const mustBeUiStateTree = value =>
  is.defined(value)
    ? is.func(value.navigate)
      ? value
      : throw new Error('must be a ui state tree')
    : value

const alsoNeedsUiStateTree = (value, ctx) =>
  is.defined(value)
    ? ctx.value?.ui
      ? value
      : throw new Error('requires ui to be provided, if defined')
    : value

const validate = <object key='form' plain strict >

  <object key='data' plain required />
  <object key='state' plain default={{}} />
  <object key='actions' plain default={{}} />
  <number key='historyMaxCount' default={256} />
  <string key='historyStorageKey' validate={alsoNeedsUiStateTree} />
  <func key='ui' validate={mustBeUiStateTree} />
  <func key='submit' required />

</object>

/******************************************************************************/
// Actions and State
/******************************************************************************/

const STATE = {

  current: null,
  original: null,
  upstream: null,

  history: [],
  historyIndex: 0
}

const ACTIONS = {

  editCurrent (path, value) {

    if (!is.defined(path))
      throw new Error('path is required')

    if (!is.defined(value))
      throw new Error('value is required')

    const [ current, setCurrent ] = this('current')

    if (is.func(value))
      value = value(current::get(path))

    setCurrent(current::set(path, value))

    if (this.config.historyStorageKey)
      this::pushToSessionStorage()

    return this
  },

  pushCurrent () {

    const {
      hasUnpushedHistory, hasChangesToCurrent
    } = this

    const requiresPush = hasUnpushedHistory || hasChangesToCurrent
    if (!requiresPush)
      return this

    const [ state, setState ] = this()
    const { historyMaxCount } = this.config

    setState(state::copy(state => {

      // remove any future states that might exist as a result of undoing
      state.history.length = min(state.history.length, state.historyIndex + 1)

      // don't repeat history
      const currentMatchesLast = last(state.history)::equals(state.current)
      if (!currentMatchesLast)
        state.history.push(state.current::copy())

      // ensure we don't have too many states
      while (state.history.length > historyMaxCount)
        state.history.shift()

      // after pushing, history index should always be at the end
      state.historyIndex = state.history.length - 1

      if (this.config.historyStorageKey)
        this::pushToSessionStorage(state)

    }))

    return this

  },

  setUpstream (object) {

    const serialized = serialize(object)

    this('upstream').set(serialized)

    return this
  },

  async pushUpstream () {

    const { current } = this

    const { submit } = this.config

    const upstream = await this::submit(current)

    if (is.defined(upstream)) {
      this.setUpstream(upstream)
      this.revertToUpstream()
    }

    return this
  },

  revertCurrentToOriginal () {
    if (!this.hasChangesToCurrent)
      return this

    this.pushCurrent()

    const { set: setCurrent } = this('current')

    setCurrent(this.original::copy())
    return this
  },

  revertToUpstream () {
    if (!this.hasChangesToUpstream)
      return this

    this.pushCurrent()

    const [ state, setState ] = this()

    setState(state::copy(state => {
      state.original = state.upstream::copy()
      state.current = state.upstream::copy()
    }))

    return this
  },

  applyHistoryToCurrent (index) {

    const [ state, setState ] = this()

    if (state.history.length === 0)
      return this

    index = clamp(index, 0, state.history.length - 1)
    if (state.historyIndex === index)
      return this

    setState(state::copy(state => {
      state.current = state.history[index]::copy()
      state.historyIndex = index
    }))

    return this
  },

  undoEditCurrent () {
    if (this.historyIndex === 0)
      this.revertCurrentToOriginal()
    else
      this.applyHistoryToCurrent(this.historyIndex - 1)

    return this
  },

  redoEditCurrent () {
    this.applyHistoryToCurrent(this.historyIndex + 1)

    return this
  }
}

/******************************************************************************/
// Main
/******************************************************************************/

function FormStateTree (config = {}) {

  const { data, state, actions, ...rest } = validate(config)

  const tree = new StateTree({
    ...state,
    ...STATE,
    original: serialize(data),
    current: serialize(data),
    upstream: serialize(data)
  }, {
    ...actions,
    ...ACTIONS
  })

  defineProperties(tree, {

    hasUnpushedHistory: {
      get () {
        const { history, historyIndex } = this
        return history.length > 0 &&
          historyIndex < (history.length - 1)
      }
    },

    hasChangesToCurrent: {
      get () {
        const { current, original } = this

        return !equals(current, original)
      }
    },

    hasChangesToUpstream: {
      get () {
        const { upstream, original } = this
        return !equals(upstream, original)
      }
    },

    canUndoEditCurrent: {
      get () {
        return this.historyIndex > 0 || this.hasChangesToCurrent
      }
    },

    canRedoEditCurrent: {
      get () {
        return this.historyIndex < this.history.length - 1
      }
    },

    config: {
      value: freeze(rest)
    }

  })

  const usingStorage = tree.config.ui && tree.config.historyStorageKey
  if (usingStorage) {
    const applyStorageToTree = tree::applyFromSessionStorage

    tree.config.ui.subscribe(
      applyStorageToTree,
      [ 'session', 'data', tree.config.historyStorageKey ]
    )

    applyStorageToTree()
  }

  return tree

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default FormStateTree

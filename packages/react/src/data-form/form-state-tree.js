import StateTree, { state, action, memoize } from '@benzed/state-tree'
import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars

import UiStateTree from '../app/state-tree/ui-state-tree'

import { equals, set, get, copy, serialize } from '@benzed/immutable'
import { clamp, min } from '@benzed/math'
import is from 'is-explicit'

/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Helper
/******************************************************************************/

const { defineProperty, freeze } = Object

function pushToSessionStorage (state) {

  const form = this
  const { historyStorageKey, ui } = form.config

  const {
    history,
    historyIndex,
    current
  } = state

  ui.session.setItem(historyStorageKey, { history, historyIndex, current })

}

/******************************************************************************/
// Validation
/******************************************************************************/

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
  <UiStateTree key='ui' />
  <func key='submit' required />

</object>

/******************************************************************************/
// Main
/******************************************************************************/

class FormStateTree extends StateTree {

  @state
  current = {}

  @state
  upstream = {}

  @state
  currentTimestamp = null

  @state
  upstreamTimestamp = null

  @state
  history = []

  @state
  historyIndex = 0

  @action
  editCurrent (path, value) {

    if (!is.defined(path))
      throw new Error('path is required')

    if (!is.defined(value))
      throw new Error('value is required')

    if (is.func(value))
      value = value(this.current::get(path))

    const current = this.current::set(path, value)

    const state = { ...this.state, current }

    if (this.config.historyStorageKey)
      this::pushToSessionStorage(state)

    return state
  }

  @action
  pushCurrent () {

    const {
      canRedoEditCurrent, hasChangesToCurrent
    } = this

    const canPush = canRedoEditCurrent || hasChangesToCurrent
    if (!canPush)
      return this.state

    const { historyMaxCount } = this.config

    const state = copy(this.state)

    // remove any future states that might exist as a result of undoing
    state.history.length = min(state.history.length, state.historyIndex + 1)

    // don't repeat history
    if (hasChangesToCurrent)
      state.history.push(state.current::copy())

    // ensure we don't have too many states
    while (state.history.length > historyMaxCount)
      state.history.shift()

    // after pushing, history index should always be at the end
    state.historyIndex = state.history.length - 1

    if (this.config.historyStorageKey)
      this::pushToSessionStorage(state)

    return state
  }

  @action
  setUpstream = object => ({
    ...this.state,
    upstream: serialize(object),
    upstreamTimestamp: new Date()
  })

  async pushUpstream () {

    const { current } = this

    const { submit } = this.config

    const upstream = await this::submit(current)

    if (is.defined(upstream)) {
      this.setUpstream(upstream)
      this.revertToUpstream()
    }

    this.setState({
      ...this.state,
      currentTimestamp: this.state.upstreamTimestamp::copy()
    })
  }

  @action
  revertToUpstream () {
    if (!this.hasChangesToUpstream)
      return this.state

    return {
      ...this.state,
      current: this.state.upstream::copy(),
      currentTimestamp: state.upstreamTimestamp::copy()
    }

  }

  @action
  applyHistoryToCurrent (index) {

    index = clamp(index, 0, this.state.history.length - 1)
    if (this.state.historyIndex === index)
      return this.state

    const state = this.state::copy(state => {
      state.current = state.history[index]::copy()
      state.historyIndex = index
    })

    if (this.config.historyStorageKey)
      this::pushToSessionStorage(state)

    return state
  }

  undoEditCurrent () {
    this.applyHistoryToCurrent(this.historyIndex - 1)
  }

  redoEditCurrent () {
    this.applyHistoryToCurrent(this.historyIndex + 1)
  }

  @action
  applyFromSessionStorage = () => {

    const { historyStorageKey, ui } = this.config

    const { history, historyIndex, current } = ui.session.getItem(historyStorageKey) || {}

    return [history, historyIndex, current].every(is.defined)
      ? this.state::copy(state => {
        state.history = history
        state.current = current
        state.historyIndex = historyIndex
      })
      : this.state
  }

  @memoize('current', 'history', 'historyIndex')
  get hasChangesToCurrent () {
    const { history, historyIndex, current } = this.state

    return !current::equals(history[historyIndex])
  }

  @memoize('upstream', 'current')
  get hasChangesToUpstream () {
    const { upstream, current } = this.state
    return !equals(upstream, current)
  }

  get canRedoEditCurrent () {
    return this.historyIndex < this.history.length - 1
  }

  get canUndoEditCurrent () {
    return this.historyIndex > 0
  }

  constructor (config = {}) {

    const { data, state, actions, ...rest } = validate(config)

    super({
      current: serialize(data),
      upstream: serialize(data),
      history: [ serialize(data) ],

      currentTimestamp: new Date(),
      upstreamTimestamp: new Date()
    })

    defineProperty(this, 'config', { value: freeze(rest) })

    const usingStorage = this.config.ui && this.config.historyStorageKey
    if (usingStorage) {

      this.config.ui.subscribe(
        this.applyFromSessionStorage,
        [ 'session', 'data', this.config.historyStorageKey ]
      )

      this.applyFromSessionStorage()
    }

    // TODO write your own @bound decorator
    this.redoEditCurrent = ::this.redoEditCurrent
    this.undoEditCurrent = ::this.undoEditCurrent
  }

  [copy.$$] () {
    const FormStateTree = this.constructor
    return new FormStateTree(this.config)
  }
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default FormStateTree

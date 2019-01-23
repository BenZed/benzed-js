import StateTree from '../state-tree'
import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars

import { equals, push, set, copy } from '@benzed/immutable'
import { clamp } from '@benzed/math'

/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Helper
/******************************************************************************/

const { defineProperties, freeze } = Object

/******************************************************************************/
// Validation
/******************************************************************************/

const validate = <object key='form' plain strict >

  <object key='original' plain required />

  <object key='state' plain default={{}} />

  <object key='actions' plain default={{}} />

  <number key='historyMaxCount' default={256} />

  <string key='historyStorageKey' />

  <object key='ui'
    /* TODO validate={mustBeUiStateTree} */
  />

</object>

/******************************************************************************/
// Actions and State
/******************************************************************************/

const STATE = {

  current: null,
  original: null,
  upstream: null,

  history: [],
  historyIndex: -1
}

const ACTIONS = {

  edit (path, value) {

    const [ current, setCurrent ] = this('current')

    setCurrent(current::set(path, value))
  },

  push () {

    const [ state, setState ] = this()

  },

  applyHistory (delta) {

    const [ historyIndex, setHistoryIndex ] = this('historyIndex')
    const { set: setCurrent } = this('current')

    const { history } = this
    if (history.length === 0)
      return

    const newIndex = clamp(historyIndex + delta, 0, history.length - 1)
    if (historyIndex === newIndex)
      return

    const data = history[newIndex]

    setHistoryIndex(newIndex)
    setCurrent(data)

  },

  undo () {
    this.applyHistory(-1)
  },

  redo () {
    this.applyHistory(1)
  }

}

/******************************************************************************/
// Main
/******************************************************************************/

function FormStateTree (config = {}) {

  const { original, state, actions, ...rest } = validate(config)

  const tree = new StateTree({
    ...state,
    ...STATE,
    current: copy(original),
    original: copy(original),
    upstream: copy(original)
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

    hasUpstreamChanges: {
      get () {
        return !equals(this.original, this.upstream)
      }
    },

    config: {
      value: freeze(rest)
    }
  })

  return tree

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default FormStateTree

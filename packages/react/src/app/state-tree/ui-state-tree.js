import { StateTree } from '../../state-tree'
import storage from '../../util/storage'

import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import { copy } from '@benzed/immutable'

import querystring from 'query-string'

// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Validate
/******************************************************************************/

const validateConfig = <object key='config' plain default={{}}>
  <string key='prefix' default='@benzed' />
</object>

/******************************************************************************/
// Helper
/******************************************************************************/

const { defineProperty } = Object

/******************************************************************************/
// StorageStateTree
/******************************************************************************/

const STORAGE_ACTIONS = {

  setItem (key, value) {
    const tree = this

    const { store } = tree
    const { prefix } = tree.config

    storage[store].setItem(`${prefix}-${key}`, value)
    tree(['data', key]).set(value)
  },

  getItem (key) {
    return this.data[key]
  },

  removeItem (key) {
    const tree = this
    const { store } = tree
    const { prefix } = tree.config

    const [ data, setData ] = tree('data')

    if (key in data === false)
      return

    storage[store].removeKey(`${prefix}-${key}`)

    const newData = copy(data)
    delete newData[key]

    setData(newData)
  },

  clear () {
    const tree = this
    const { store } = tree
    const { prefix } = tree.config

    // only remove keys with prefix
    for (let i = 0; i < storage[store].length; i++) {
      const key = storage[store].key(i)
      if (key.indexOf(prefix) !== 0)
        continue

      storage[store].removeItem(key)
    }

    tree('data').set({})
  },

  key (i) {
    const tree = this
    const { data } = tree

    return Object.keys(data)[i]
  }

}

function StorageStateTree (store, config) {

  const data = {}

  // populate data
  for (let i = 0; i < storage[store].length; i++) {
    const key = storage[store].key(i)
    if (key.indexOf(config.prefix) !== 0)
      continue

    data[key.replace(config.prefix + '-', '')] = storage[store].getItem(key)
  }

  const stateTree = new StateTree({
    data
  },
  STORAGE_ACTIONS)

  defineProperty(stateTree, 'config', { value: config, enumerable: true })
  defineProperty(stateTree, 'store', { value: store, enumerable: true })

  return stateTree
}

/******************************************************************************/
// State and Actions
/******************************************************************************/

const UI_ACTIONS = {

  navigate (to, query = {}) {

    const { history } = this.config

    let suffix = querystring.stringify(query)
    suffix = suffix && '?' + suffix

    history.push(to + suffix)

  }

}

/******************************************************************************/
// UiStateTree
/******************************************************************************/

function UiStateTree (config = {}, state = {}, actions = {}) {

  config = validateConfig(config)

  const stateTree = new StateTree({
    local: new StorageStateTree('local', config),
    session: new StorageStateTree('session', config),
    ...state
  }, {
    ...UI_ACTIONS,
    ...actions
  })

  defineProperty(stateTree, 'config', { value: config, enumerable: true })

  return stateTree

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default UiStateTree

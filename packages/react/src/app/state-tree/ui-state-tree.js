import StateTree, { state, action } from '@benzed/state-tree'
import storage from '../../util/storage'

import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import { copy, set } from '@benzed/immutable'

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

class StorageStateTree extends StateTree {

  @state
  data = {}

  @action('data')
  setItem (key, value) {

    const { store } = this
    const { prefix } = this.config

    storage[store].setItem(`${prefix}-${key}`, value)

    return this.data::set(key, value)
  }

  getItem (key) {
    return this.data[key]
  }

  @action('data')
  removeItem (key) {

    const { store } = this
    const { prefix } = this.config
    const { data } = this.state

    if (key in data === false)
      return this.state

    storage[store].removeKey(`${prefix}-${key}`)

    const newData = copy(data)
    delete newData[key]

    return newData
  }

  @action('data')
  clear () {

    const { store } = this
    const { prefix } = this.config

    // only remove keys with prefix
    for (let i = 0; i < storage[store].length; i++) {
      const key = storage[store].key(i)
      if (key.indexOf(prefix) !== 0)
        continue

      storage[store].removeItem(key)
    }

    return {}
  }

  key (i) {
    const { data } = this

    return Object.keys(data)[i]
  }

  constructor (store, config) {

    const data = {}

    // populate data
    for (let i = 0; i < storage[store].length; i++) {
      const key = storage[store].key(i)
      if (key.indexOf(config.prefix) !== 0)
        continue

      data[key.replace(config.prefix + '-', '')] = storage[store].getItem(key)
    }

    super({ data })

    defineProperty(this, 'config', { value: config, enumerable: true })
    defineProperty(this, 'store', { value: store, enumerable: true })

  }

  [copy.$$] () {
    const StorageStateTree = this.constructor
    return new StorageStateTree(this.store, this.config)
  }

}

/******************************************************************************/
// UiStateTree
/******************************************************************************/

class UiStateTree extends StateTree {

  @state
  local = null

  @state
  session = null

  navigate (to, query = {}) {

    const { history } = this.config

    let suffix = querystring.stringify(query)
    suffix = suffix && '?' + suffix

    history.push(to + suffix)

  }

  constructor (config) {

    config = validateConfig(config)

    super({
      local: new StorageStateTree('local', config),
      session: new StorageStateTree('session', config)
    })

    defineProperty(this, 'config', { value: config, enumerable: true })
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default UiStateTree

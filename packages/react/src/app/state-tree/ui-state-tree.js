import StateTree, { state, action } from '@benzed/state-tree'
import { storage, isClient, on, Delay } from '../../util'

import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import { equals, copy, set } from '@benzed/immutable'

import querystring from 'querystring'
import is from 'is-explicit'

// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Data
/******************************************************************************/

const DROPZONE_CLEAR_DELAY = 100

/******************************************************************************/
// Validate
/******************************************************************************/

const isHistoryObject = value =>
  [ 'push', 'length', 'location' ].every(key => key in value)
    ? value
    : throw new Error('Must be a history object')

const validateConfig = <object key='config' plain default={{}}>
  <string key='prefix' default='@benzed' />
  <object key='history' required validate={isHistoryObject} />
</object>

/******************************************************************************/
// Helper
/******************************************************************************/

const { defineProperty } = Object

const getDropzoneNames = e => Array
  .from(
    e.dataTransfer.types,
    name => name.toLowerCase()
  )

const syncDropTypeChangesToState = tree => {

  if (!isClient())
    return

  const clearDropzoneDelay = new Delay(
    () => tree.setState([], 'activeDropzones'),
    DROPZONE_CLEAR_DELAY
  )

  const onDragOver = e => {
    e.preventDefault()

    const activeDropzones = getDropzoneNames(e)
    if (!equals(activeDropzones, tree.activeDropzones))
      tree.setState(activeDropzones, 'activeDropzones')

    clearDropzoneDelay.invoke()
  }

  on(window, 'dragover', onDragOver)

}

const syncHistoryLocationToState = tree => {
  // Sync local location state to history

  const { history } = tree.config

  const setLocation = location => {
    const nextLocation = {
      ...copy(location),
      query: querystring.parse(location.search.replace('?', ''))
    }

    return tree.setState(nextLocation, 'location', 'setLocation')
  }

  history.listen(setLocation)
  setLocation(history.location)

}

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

  @state
  location = null

  @state
  activeDropzones = []

  @state
  notifications = []

  @action('notifications')
  clearNotification = notification => this
    .notifications
    .filter(n => !equals(n, notification))

  @action('notifications')
  addNotification ({ brand = 'primary', delay, ...rest }) {

    const notification = {
      brand,
      delay,
      created: new Date(),
      ...rest
    }

    if (is.number(delay))
      setTimeout(
        () => this.clearNotification(notification),
        delay
      )

    return [ ...this.notifications, notification ]
  }

  navigate = (to, query = {}, state = {}) => {

    if (to === this.location.pathname &&
      equals(query, this.location.query) &&
      equals(state, this.location.state)
    )
      return

    const { history } = this.config

    const search = querystring.stringify(query)

    history.push(`${to}${search && '?' + search}`, state)

  }

  constructor (config) {

    config = validateConfig(config)

    super({
      local: new StorageStateTree('local', config),
      session: new StorageStateTree('session', config)
    })

    defineProperty(this, 'config', { value: config, enumerable: true })
    syncDropTypeChangesToState(this)
    syncHistoryLocationToState(this)

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default UiStateTree

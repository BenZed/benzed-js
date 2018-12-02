import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import { set } from '@benzed/immutable'

/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Validate
/******************************************************************************/

const atLeastOneType = value =>
  value.before || value.after || value.error
    ? value
    : throw new Error('at least one type must be enabled: before, after or error')

const atLeastOneMethod = value =>
  value.all || value.find || value.get ||
  value.patch || value.update || value.create || value.remove
    ? value
    : throw new Error('at least one method must be enabled: all, find, get, patch, update, create or remove')

const validateOptions = <object
  plain
  required
  strict
  validate={[atLeastOneType, atLeastOneMethod]}
>
  <bool key='before' />
  <bool key='after' />
  <bool key='error' />
  <bool key='all' />
  <bool key='patch' />
  <bool key='update' />
  <bool key='find' />
  <bool key='get' />
  <bool key='create' />
  <bool key='remove' />
</object>

/******************************************************************************/
// Helper
/******************************************************************************/

const buildHooks = (types, methods, hooks) => {

  const arranged = {}

  for (const type of types)
    for (const method of methods)
      set.mut(arranged, [ type, method ], hooks
        .map(hook => hook._call ? hook() : hook))

  return arranged
}

const keysOfTruthyValues = obj => {
  const keys = []
  for (const key in obj)
    if (obj[key])
      keys.push(key)

  return keys
}

/******************************************************************************/
// Main
/******************************************************************************/

const hooks = props => {

  const { children, ...options } = props

  const { before, after, error, ...rest } = validateOptions(options)

  const types = keysOfTruthyValues({ before, after, error })
  const methods = keysOfTruthyValues(rest)

  return context => {

    const hooks = buildHooks(types, methods, children)

    context._hooksToAdd = context._hooksToAdd || []
    context._hooksToAdd.push(hooks)
  }
}
/******************************************************************************/
// Exports
/******************************************************************************/

export default hooks

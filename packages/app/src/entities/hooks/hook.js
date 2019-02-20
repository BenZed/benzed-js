import { first } from '@benzed/array'
import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import { capitalize } from '@benzed/string'

import is from 'is-explicit'

/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Helper
/******************************************************************************/

const checkContext = (ctx, { types, methods, name, provider }) => {

  // this will fail, anyway
  if (ctx.method === 'update' && !is.defined(ctx.id))
    return false

  if (methods && !methods.includes(ctx.method))
    return false

  if (types && !types.includes(ctx.type))
    return false

  if (provider && !providerMatch(ctx, provider))
    return false

  return true
}

const providerMatch = (ctx, provider) => {

  const providerParam = ctx.params.provider

  // hook should only fire if it's an external call
  if (provider === 'external' && providerParam)
    return true

  // hook should only fire if it's an internal call
  if (provider === 'internal' && !providerParam)
    return true

  // hook should only fire for a specific provider (rest or socketio)
  if (provider === providerParam)
    return true

  // hook should not fire
  return false
}

const decorateContext = (ctx, { name }) => {

  // add name
  if ('name' in ctx === false && name)
    ctx.name = name

  const methodName = `is${capitalize(ctx.method)}`
  if (methodName in ctx === false)
    ctx[methodName] = true

  // already been decorated
  if ('isMulti' in ctx === false) {

    // is viewing multiple records
    let isMulti = ctx.method === 'find'

    // is creating multiple records
    isMulti = isMulti || (ctx.method === 'create' && is.array(ctx.data))

    // is paching or removing multiple records
    isMulti = isMulti || (!is.defined(ctx.id) && (
      ctx.method === 'remove' ||
      ctx.method === 'patch'
    ))

    ctx.isMulti = isMulti
  }

}

const addName = (hook, { name }) =>

  name
    ? Object.defineProperty(hook, 'name', { value: name })
    : hook

/******************************************************************************/
// Validation
/******************************************************************************/

const validateConfig = <object plain required strict>

  <array key='methods' cast >
    <oneOf>find get update patch create remove</oneOf>
  </array>

  <array key='types' cast >
    <oneOf>before after error</oneOf>
  </array>

  <oneOf key='provider'>rest socketio internal external</oneOf>

  <array key='children'
    length={[ 1, 'only one hook function' ]}
    required='must have a hook function'
    cast
  >
    <func required />
  </array>

  <string key='name' default={ctx => first(ctx.value.children)?.name}/>

</object>

/******************************************************************************/
// Main
/******************************************************************************/

const hook = props => {

  const { children, ...options } = validateConfig(props)

  const hookLogic = first(children)

  const hookWrapped = ctx => {

    if (!checkContext(ctx, options))
      return

    decorateContext(ctx, options)

    return hookLogic(ctx)
  }

  return addName(hookWrapped, options)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default hook

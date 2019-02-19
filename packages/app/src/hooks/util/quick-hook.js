import { capitalize } from '@benzed/string'
import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import is from 'is-explicit'

// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Validation
/******************************************************************************/

const validateConfig = <object
  plain
  required
  strict
  // cast func to obj
  cast={exec => is.func(exec)
    ? { exec }
    : exec}>

  <array key='methods' cast >
    <oneOf>all find get update patch create remove</oneOf>
  </array>

  <array key='types' cast >
    <oneOf>before after error</oneOf>
  </array>

  <oneOf key='provider'>rest socketio internal external</oneOf>

  <func key='exec' required />

  <func key='setup' />

  <bool key='info' default={!!true} />

  <string key='name' default={ctx => ctx.value.func.name}/>

</object>

/******************************************************************************/
// Helper
/******************************************************************************/

const checkContext = (config, ctx) => {

  const { types, methods } = config

  if (types && !types.includes(ctx.type))
    throw new Error(`The '${config.name}' hook can only be used as a '${types}' hook.`)

  if (methods && !methods.includes(ctx.method))
    throw new Error(`The '${config.name}' hook can only be used on the '${methods}' service methods.`)

  if (!config.info)
    return ctx

  // ctx.isCreate for example, will be true if it doesn't already exist in ctx
  const isMethodKey = `is${capitalize(ctx.method)}`
  if (isMethodKey in ctx === false)
    ctx[isMethodKey] = true

  // ctx.isBefore for example, will be true if it doesn't already exist in ctx
  const isTypeKey = `is${capitalize(ctx.type)}`
  if (isTypeKey in ctx === false)
    ctx[isTypeKey] = true

  if ('isBulk' in ctx === false) {
    const isBulkCreate = ctx.method === 'create' && is.array(ctx.data)
    const isBulkEditOrRemove = !is.defined(ctx.id) && (
      ctx.method === 'remove' ||
      ctx.method === 'update' ||
      ctx.method === 'patch'
    )

    ctx.isBulk = isBulkCreate || isBulkEditOrRemove
  }

  return ctx
}

const providerMatch = (provider, providerParam) => {

  if (provider === 'any')
    return true

  // hook should only fire if it's an external call
  if (provider === 'external' && providerParam)
    return true

  // hook should only fire if it's an internal call
  if (provider === 'internal' && !providerParam)
    return true

  // hook should only fire for a specific provider (rest or socketio)
  return provider === providerParam
}

function hook (ctx, ...args) {

  const config = this
  const { exec, provider, ...check } = config

  if (!providerMatch(provider, ctx.params.provider))
    return

  ctx = checkContext(check, ctx)

  return exec(ctx, ...args)

}

function nestSetup (config) {

  const quickHook = this

  const { setup, name } = config

  const builder = input => {
    const options = setup(input)
    const quickHookWithOptions = ctx => quickHook(ctx, options)

    return quickHookWithOptions::addName(name)
  }

  return builder::addName(`build${capitalize(config.name || 'hook')}`)

}

function addName (value) {
  return value
    ? Object.defineProperty(this, 'name', { value })
    : this
}

/******************************************************************************/
// Factory
/******************************************************************************/

function QuickHook (config, setup, exec) {

  if (is.func(setup) && !is.func(exec)) {
    exec = setup
    setup = null
  }

  if (is.func(setup) && is.object(config))
    config.setup = setup

  if (is.func(exec) && is.object(config))
    config.exec = exec

  config = validateConfig(config)

  const quickHook = config::hook

  return config.setup
    ? quickHook::nestSetup(config)
    : quickHook::addName(config.name)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default QuickHook

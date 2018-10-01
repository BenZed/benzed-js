import Hook from './hook'

import { BadRequest } from '@feathersjs/errors'
import { wrap, unwrap } from '@benzed/array'
import { set, merge } from '@benzed/immutable'

import { AUTH_PRIORITY } from './jwt-auth'

import is from 'is-explicit'

/******************************************************************************/
// Helper
/******************************************************************************/

async function updateEvery (docs) {

  const service = this

  const params = { $skipValidation: true }

  const results = []
  for (const doc of docs)
    results.push(
      await service.update(doc[service.id], doc, params)
    )

  return results

}

/******************************************************************************/
// Setup
/******************************************************************************/

function setup (config) {

  if (is.func(config))
    config = { validator: config }

  if (!is.plainObject(config))
    throw new Error('validateSchema requires a config')

  if (!is.func(config.validator))
    throw new Error('Validator must be a function')

  return { ...config }
}

async function exec (ctx) {

  const hook = this

  const { isFind, isGet, isRemove, isPatch, isBulk } = hook.checkContext(ctx)
  const { service, params } = ctx

  const isNonApplicableMethod = isFind || isGet || isRemove
  if (isNonApplicableMethod || params.$skipValidation)
    return

  const { validator } = hook.options

  let datas
  let errors

  // cast data to an array
  if (isPatch && isBulk) {
    datas = await service.find({ query: params.query })
    datas = datas.map(data => merge(data, ctx.data))
  } else
    datas = wrap(ctx.data)

  // Validate all data
  for (let i = 0; i < datas.length; i++) try {

    const data = datas[i]
    const id = data[service.id]

    await validator(data, ctx)

    // bulk patches get converted to individual updates, but the id field
    // may not survive validation
    if (isPatch && isBulk && is.defined(id))
      data[service.id] = id

  } catch (e) {

    if (!errors)
      errors = Array(datas.length).fill(null)

    errors[i] = set({}, e.path, e.rawMessage)
  }

  // if there are errors, throw them
  if (errors) throw new BadRequest('Validation Failed.', {
    errors: isBulk ? errors : unwrap(errors)
  })

  // patches get converted to updates, since we've already queried all the required
  // documents from the database, and each documents validated data may not
  // necessarily be the same as the ctx.data that was provided
  else if (isPatch && isBulk)
    ctx.result = await service::updateEvery(datas)

  else
    ctx.data = isBulk ? datas : unwrap(datas)

  return ctx

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default new Hook({

  name: 'validate-hook',
  priority: AUTH_PRIORITY + 100,
  types: 'before',

  setup,
  exec

})

import { QuickHook } from './util'
import is from 'is-explicit'

import { BadRequest } from '@feathersjs/errors'
import { wrap } from '@benzed/array'
import { set, merge } from '@benzed/immutable'

import Schema, { isSchema } from '@benzed/schema' // eslint-disable-line no-unused-vars

// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope */
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

const mustBeSchema = value =>
  isSchema(value)
    ? value
    : throw new Error('must be a validator created by Schema.')

/******************************************************************************/
// Exports
/******************************************************************************/

export default new QuickHook({

  name: 'schema-validate',
  types: 'before',

  setup: <object key='validate'>
    <func key='schema' required validate={mustBeSchema} />
  </object>,

  async exec (ctx, { schema }) {

    const { service, params } = ctx

    const isNonApplicableMethod = ctx.isFind || ctx.isGet || ctx.isRemove
    if (isNonApplicableMethod || params.$skipValidation)
      return

    let datas
    let errors

    // cast data to an array
    if (ctx.isPatch && ctx.isBulk) {
      const result = await service.find({ query: params.query })
      datas = result.data.map(data => merge(data, ctx.data))
    } else
      datas = wrap(ctx.data)

    // Validate all data
    for (let i = 0; i < datas.length; i++) try {

      const data = datas[i]
      const id = data[service.id]

      await schema(data, { data: ctx })

      // bulk patches get converted to individual updates, but the id field
      // may not survive validation
      if (ctx.isPatch && ctx.isBulk && is.defined(id))
        data[service.id] = id

    } catch (e) {

      if (e.name !== 'ValidationError')
        throw e

      errors = errors || Array(datas.length).fill(null)

      errors[i] = set({}, e.path, e.rawMessage)
    }

    // if there are errors, throw them
    if (errors) throw new BadRequest('Validation Failed.', {
      errors: ctx.isBulk ? errors : errors[0]
    })

    // patches get converted to updates, since we've already queried all the required
    // documents from the database, and each documents validated data may not
    // necessarily be the same as the ctx.data that was provided
    else if (ctx.isPatch && ctx.isBulk)
      ctx.result = await service::updateEvery(datas)
    else
      ctx.data = ctx.isBulk
        ? datas
        : datas[0]

    return ctx

  }

})

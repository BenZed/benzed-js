import { Schema, defaultTo, string, object, required } from '@benzed/schema'
import { wrap, unwrap } from '@benzed/array'

import Hook from './hook'

/******************************************************************************/
// Helper
/******************************************************************************/

// TODO I use this function often enough it should probably be a @benzed/schema export
const boolToObject = value => value === true
  ? {}
  : value === false
    ? null
    : value

/******************************************************************************/
// Main
/******************************************************************************/

const setup = new Schema(object({

  cast: boolToObject,
  shape: {
    createField: string(defaultTo('created')),
    updateField: string(defaultTo('updated'))
  },

  validators: required

}))

async function exec (ctx) {

  const hook = this
  const { isBulk, isCreate, isUpdate } = hook.checkContext(ctx)

  // TODO maybe checkContext should throw so I don't have to do this part
  if (isBulk && isUpdate) // This will fail anyway
    return

  const time = new Date()
  const { createField, updateField } = hook.options
  const { id, service, data } = ctx

  // In case this is a bulk create request
  const datas = wrap(data)
  for (const data of datas) {

    if (isCreate)
      data[createField] = time

    // Update replaces all of the fields in a document, so we have to get the
    // value of the created Date from the database, and add it to the supplied
    // data.
    else if (isUpdate) {
      // If we've gotten here, this is not a bulk request, so the id will not be
      // undefined
      const existing = await service.get(id)
      data[createField] = existing[createField]
    }

    data[updateField] = time
  }

  ctx.data = isBulk && isCreate
    ? datas
    : unwrap(datas)

  return ctx
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default new Hook({

  name: 'write-date-fields',
  priority: 1000,

  type: 'before',
  methods: ['create', 'update', 'patch'],

  setup,
  exec
})
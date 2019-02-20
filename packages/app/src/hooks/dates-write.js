import { QuickHook } from './util'
import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import { wrap } from '@benzed/array'

import declareEntity from '../declare-entity'

// @jsx Schema.createValidator
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
//
/******************************************************************************/

const validate = <object strict plain default={{}}>
  <string key='createField' default='created' required />
  <string key='updateField' default='updated' required />
</object>

/******************************************************************************/
// Exports
/******************************************************************************/

export default props => {

  const { createField, updateField } = validate(props)

  return declareEntity('hook', {}, async ctx => {

    const { id, service, data } = ctx

    const { createField, updateField } = config

    // Not applicable methods
    if (ctx.isRemove || ctx.isFind || ctx.isGet)
      return

    if (ctx.isBulk && ctx.isUpdate) // This will fail anyway
      return

    const time = new Date()

    // In case this is a bulk create request
    const asBulk = wrap(data)
    for (const data of asBulk) {

      if (ctx.isCreate)
        data[createField] = time

      // Update replaces all of the fields in a document, so we have to get the
      // value of the created Date from the database, and add it to the supplied
      // data.
      else if (ctx.isUpdate) {
        const existing = await service.get(id)
        data[createField] = existing[createField]
      }

      data[updateField] = time

    }

    ctx.data = ctx.isBulk && ctx.isCreate
      ? asBulk
      : asBulk[0]

    return ctx
  })

}

import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import { wrap, first } from '@benzed/array'

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

  return declareEntity(
    'hook',
    {
      name: 'write-date-fields',
      types: 'before',
      methods: ['patch', 'create', 'update']
    },
    async ctx => {

      const { id, service, data } = ctx

      const time = new Date()

      // In case this is a bulk create request
      const asMulti = wrap(data)
      for (const data of asMulti) {

        if (ctx.isCreate)
          data[createField] = time

        // Update replaces all of the fields in a document, so we have to get
        // the value of the created Date from the database, and add it to the
        // supplied data.
        else if (ctx.isUpdate) {
          const existing = await service.get(id)
          data[createField] = existing[createField]
        }

        data[updateField] = time
      }

      ctx.data = ctx.isMulti && ctx.isCreate
        ? asMulti
        : first(asMulti)

      return ctx
    })

}

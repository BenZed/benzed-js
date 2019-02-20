import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import { wrap, first } from '@benzed/array'
import { copy } from '@benzed/immutable'

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
      methods: [ 'patch', 'create' ]
    },
    ctx => {

      const { data } = ctx

      const time = new Date()

      // In case this is a bulk create request
      const dataAsArray = wrap(data)
      for (const data of dataAsArray) {

        if (ctx.isCreate && createField in data === false)
          data[createField] = copy(time)

        if (updateField in data === false)
          data[updateField] = copy(time)
      }

      ctx.data = ctx.isMulti && ctx.isCreate
        ? dataAsArray
        : first(dataAsArray)

      return ctx
    })

}

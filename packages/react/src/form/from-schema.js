import React from 'react'

import is from 'is-explicit'
import * as inputs from './inputs'

/******************************************************************************/
// Main
/******************************************************************************/

function FromSchema ({ schema, path = [], inputComponentMap, ...props }) {

  const componentMap = inputComponentMap || this || inputs

  const {
    component: componentKey = schema.type.name,
    private: privateProperty = schema.key?.charAt(0) === '_',
    ...schemaProps
  } = schema.data?.form || {}

  if (privateProperty)
    return null

  const Component = is.func(componentKey)
    ? componentKey
    : componentMap[componentKey]

  return Component
    ? <Component {...props} {...schemaProps} schema={schema} path={path} />
    : null

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default FromSchema

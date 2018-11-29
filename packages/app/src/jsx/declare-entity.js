
import * as entities from './entities'
import { $$entity } from './util'

import is from 'is-explicit'

/******************************************************************************/
// Main
/******************************************************************************/

function declareEntity (type, props, ...children) {

  if (type in entities === false)
    throw new Error(`${type} not recognized.`)

  props = { ...props }
  children = children.filter(is.defined)

  children = children.length > 0
    ? children
    : null

  const entity = entities[type]({ ...props, children })
  if (!is.func(entity))
    throw new Error(`${type} entity did not resolve to function.`)

  entity[$$entity] = { type, props, children }

  return entity

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default declareEntity

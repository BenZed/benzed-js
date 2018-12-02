
import ENTITIES from './entities'
import { $$entity } from './util'

import is from 'is-explicit'

/******************************************************************************/
// Main
/******************************************************************************/

function declareEntity (type, props, ...children) {

  const factory = is.string(type)
    ? ENTITIES[type]
    : is.func(type)
      ? type
      : null

  if (!is.func(factory))
    throw new Error(`'${type}' not a recognized entity.`)

  if ($$entity in factory)
    throw new Error('cannot declare nested entities, place it inside a function.')

  props = { ...props }
  children = children.filter(is.defined)

  children = children.length > 0
    ? children
    : null

  const entity = factory({ ...props, children })
  if (!is.func(entity))
    throw new Error(`'${factory.name}' did not resolve to function.`)

  entity[$$entity] = { type, props, children }

  return entity

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default declareEntity

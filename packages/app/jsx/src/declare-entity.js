
import * as entities from './entities'
import { ENTITY } from './util'

import is from 'is-explicit'

/******************************************************************************/
// Main
/******************************************************************************/

function declareEntity (type, props, ...children) {

  if (type in entities === false)
    throw new Error(`${type} not recognized.`)

  props = { ...props }
  children = children.filter(is.defined)

  if (children.length > 0)
    props.children = children

  const entity = entities[type](props)

  entity[ENTITY] = { type, props }

  return entity

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default declareEntity

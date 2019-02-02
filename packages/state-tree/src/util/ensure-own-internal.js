import { $$internal } from './symbols'

import { copy } from '@benzed/immutable'

/******************************************************************************/
// Has Own
/******************************************************************************/

const hasOwnInternal = Type => {

  const basePrototype = Object.getPrototypeOf(Type.prototype)
  const BaseType = basePrototype.constructor

  const isReferenceEqual = BaseType[$$internal] === Type[$$internal]
  return !isReferenceEqual

}

/******************************************************************************/
// Main
/******************************************************************************/

const ensureOwnInternal = prototype => {
  const Type = prototype.constructor

  // base classes should not have their $$internal property mutated
  if (!hasOwnInternal(Type))
    Type[$$internal] = copy(Type[$$internal])

  return Type[$$internal]
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default ensureOwnInternal

import is from 'is-explicit'

import { flatten } from '@benzed/array'

/******************************************************************************/
// Helper
/******************************************************************************/

const isComplexResult = input => is.plainObject(input) &&
  Object.keys(input).length === 2 &&
  'validators' in input &&
  'props' in input

/******************************************************************************/
// Main
/******************************************************************************/

const mergeResults = (...results) => {

  let validators = []
  let props = null

  for (const result of results) {

    const isComplex = isComplexResult(result)
    if (isComplex)
      props = props || {}

    const isJustProps = !isComplex && is.plainObject(result)

    const otherProps = isComplex
      ? result.props
      : isJustProps
        ? result
        : null

    if (otherProps) for (const key in otherProps)
      props[key] = otherProps[key]

    if (!isJustProps)
      validators.push(isComplex ? result.validators : result)

  }

  validators = flatten(validators).filter(is.func)

  return props
    ? { props, validators }
    : validators

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default mergeResults

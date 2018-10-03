import createTyper from './create-typer'
import is from 'is-explicit'

/******************************************************************************/
// Validators
/******************************************************************************/

function checker (value) {
  const type = this

  if (!is(value, type))
    throw new TypeError(`must be of type: ${type.name}`)

  return value
}

function caster (value) {

  const { cast, type } = this

  return is(value, type)
    ? value
    : cast(value)

}

/******************************************************************************/
// Typer
/******************************************************************************/

function typeOf (props, children) {

  const data = this
  const { name, type } = data

  if (children && children.length > 0)
    throw new Error(`${name} should not have any children.`)

  const { cast, ...rest } = props

  if (is.defined(cast) && !is.func(cast))
    throw new Error(`${name} cast prop should be a function`)

  const validators = [

    cast && { type, cast }::caster,
    type::checker

  ]

  return validators.filter(is.defined)
}

/******************************************************************************/
// Factory
/******************************************************************************/

const typeOfFactory = type => {

  if (!is.instanceable(type))
    throw new Error('typeOf requires an instancable function to be used as a type')

  return createTyper(
    typeOf,
    {
      type,
      name: `type-of-${(type.name || 'unknown').toLowerCase()}`
    }
  )

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default typeOfFactory

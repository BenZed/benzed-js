import React from 'react'

import useForm from '../use-form'

import { wrap, first } from '@benzed/array'
import { splice } from '@benzed/immutable'

import is from 'is-explicit'

/******************************************************************************/
// Helper
/******************************************************************************/

const determineValues = (option, selected, multiple, additive, required) => {

  if (!multiple)
    return !required && option === selected
      ? null
      : option

  const index = selected.indexOf(option)
  const isSelected = index > -1
  if (additive)
    return isSelected // option is already selected
      ? required && selected.length === 1
        ? selected
        : splice(selected, index, 1)
      : [ ...selected, option ]

  return !required && isSelected && selected.length === 1
    ? []
    : wrap(option)

}

const useSelected = (form, path, defaultValue, multiple, options, required) => {
  let selected = useForm.valueAtPath(form, path) || defaultValue

  selected = multiple
    ? wrap(selected).filter(is.defined)
    : selected

  if (required && multiple && selected.length === 0)
    selected = [ ...selected, first(options) ]

  if (required && !multiple && !options.includes(selected))
    selected = first(options)

  return selected
}

/******************************************************************************/
// Main Component
/******************************************************************************/

const Values = props => {

  const {
    path,
    options,
    defaultValue,
    multiple,
    required,

    ...rest
  } = props

  const form = useForm()
  const selected = useSelected(
    form,
    path,
    defaultValue,
    multiple,
    options,
    required
  )

  return <ul {...rest} data-selectable>
    {
      options.map((option, i) =>
        <li
          key={i}
          data-selected={multiple
            ? selected.includes(option)
            : selected === option
          }

          onClick={e => {
            e.preventDefault()

            const updated = determineValues(
              option,
              selected,
              multiple,
              e.shiftKey,
              required
            )

            form.editCurrent(path, updated)
            form.pushCurrent()
          }}>
          {option}
        </li>
      )
    }
  </ul>
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Values

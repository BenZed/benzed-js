import React from 'react'

import useForm from '../use-form'

import { wrap, unwrap } from '@benzed/array'

/******************************************************************************/
// Main Component
/******************************************************************************/

const Select = props => {

  const {
    path,
    options,
    defaultValue,
    multiple,

    ...rest
  } = props

  const form = useForm()
  const value = useForm.valueAtPath(form, path) || defaultValue

  return <select
    onChange={e => {
      e.preventDefault()

      const current = []
      for (const option of Array.from(e.target.options))
        if (option.selected)
          current.push(option.value)

      const selected = multiple
        ? current
        : unwrap(current)

      form.editCurrent(path, selected)
      form.pushCurrent()
    }}
    multiple={multiple}
    value={multiple ? wrap(value) : value}
    {...rest}
  >

    {options.map(value =>
      <option
        key={value}
        value={value}
      >
        {value}
      </option>)
    }

  </select>
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Select

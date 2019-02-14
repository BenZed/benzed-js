import React from 'react'
import styled from 'styled-components'

import { Flex } from '../layout'
import { Label } from '../text'
import { last } from '@benzed/array'

/******************************************************************************/
// Styles
/******************************************************************************/

const _ErrorLabel = styled(Label)`
  font-weight: normal;
  font-size: 0.8em;
`

const _NameLabel = styled(Label)`
  flex-grow: 1;
  flex-shrink: 0;

  text-align: left;
`

/******************************************************************************/
// Main Components
/******************************************************************************/

// const Input = styled.input`
//   display: flex;
//   flex-direction: row;
//
//   border-color: ${$.ifProp('error').prop('theme', 'brand', 'danger')};
//
//   padding: 0.25em;
// `

const Input = styled(props => {

  const {
    error, path, label,
    NameLabel = _NameLabel,
    ErrorLabel = _ErrorLabel,

    children,
    ...rest
  } = props

  const _label = label === undefined
    ? <NameLabel>{last(path)}</NameLabel>
    : label
      ? <NameLabel>{label}</NameLabel>
      : null

  const _error = error
    ? <ErrorLabel brand='danger'>{error}</ErrorLabel>
    : null

  // TODO make schema.propTypes work
  // const flex = stripProps(Flex, rest)

  return <Flex {...rest}>
    {_label}
    <Flex grow>
      {children}
      {_error}
    </Flex>
  </Flex>
})`
  text-align: right;
`

Input.defaultProps = {
  direction: 'row',
  items: 'baseline',
  grow: false
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Input

import React, { useRef, useState, useContext, createContext } from 'react'

import styled from 'styled-components'

import { Color } from '../../themes'

import { first, adjacent } from '@benzed/array'

/******************************************************************************/
// Data
/******************************************************************************/

const COLORS = [
  'red', 'blue', 'green'
]

/******************************************************************************/
// Context
/******************************************************************************/

const ColorContext = createContext()

const ColorButton = styled(props => {

  const { setColor, children, style, ...rest } = props
  const color = useContext(ColorContext)

  const onClick = e => setColor(adjacent(COLORS, color))

  const dark = Color(color).darken(0.33)
  const light = Color(color).lighten(0.33)

  return <button
    onClick={onClick}
    color={color}
    style={{
      ...style,
      color: dark,
      borderColor: dark,
      backgroundColor: light
    }}
    {...rest}>
    {color}
  </button>
})`
  border-radius: 0.4em;
  border-width: 1px;
  border-style: solid;
`

/******************************************************************************/
// Main Component
/******************************************************************************/

const Main = styled(props => {

  const { children, ...rest } = props

  const someRef = useRef(null)

  const [ color, setColor ] = useState(first(COLORS))

  return <div {...rest} ref={someRef}>

    <h2>Learning React Hooks</h2>

    <ColorContext.Provider value={color} >
      <ColorButton setColor={setColor}/>
    </ColorContext.Provider>

    {children}

  </div>
})`
  padding: 1em;
`

/******************************************************************************/
// Exports
/******************************************************************************/

export default Main

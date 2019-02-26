import React, { useState } from 'react'
import styled from 'styled-components'

import { $, useStateTree } from '../util'
import { wrap } from '@benzed/array'

import is from 'is-explicit'

/******************************************************************************/
// TODO move to @benzed/react
/******************************************************************************/

const Dropzone = styled(({ handle, handler, children, processor, ...props }) => {

  // Hooks
  const ui = useStateTree.context('ui')
  useStateTree.observe(ui, 'activeDropzones')

  const [ over, setOver ] = useState(false)

  // Props
  const handling = wrap(handle).filter(::ui.activeDropzones.includes)

  const active = handling.length > 0

  // Handlers
  const onDrop = async e => {
    e.preventDefault()
    e.persist()
    setOver(false)

    const processed = await Promise.all(
      handling.map(
        handle => processor(e, handle)
      )
    )

    for (let i = 0; i < handling.length; i++)
      handler(processed[i], handling[i])

  }

  return handler
    ? <div {...props}
      data-active={active}
      data-over={active && over}
      onDrop={active ? onDrop : null}
      onDragEnter={active ? () => setOver(true) : null}
      onDragLeave={active ? () => setOver(false) : null}
    >{
        is.func(children)
          ? children({ active, handling })
          : children
      }</div>

    : null
})`
  position: absolute;
  top: 0em;
  left: 0em;
  right: 0em;
  bottom: 0em;

  transition: background-color 250ms, border-width 250ms;
  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: inherit;

  pointer-events: none;
  color: ${$.branded.or.prop('theme', 'brand', 'primary')};
  border: solid 0em ${$.branded.fade(0.25).or.prop('theme', 'brand', 'primary').fade(0.25)};

  &[data-active=true] {
    pointer-events: auto;
    z-index: 1000;
    background-color: ${$.theme.bg.mut((color, props) => color.fade(1 - props.bgOpacity))};
    border-width: 0.125em;
  }

  &[data-over=true] {
    border-width: 0.5em;
  }
`

Dropzone.defaultProps = {
  processor: (e, handle) => handle === 'files'
    ? e.dataTransfer.files
    : e.dataTransfer.getData(handle)
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Dropzone

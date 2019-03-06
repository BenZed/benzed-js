import React from 'react'

/******************************************************************************/
// TODO Implement me?
/******************************************************************************/

// Do some thinking on this

/******************************************************************************/
// Main Component
/******************************************************************************/

const Flex = () => ['direction', 'align', 'justify', 'wrap', 'basis', 'grow', 'shrink']

const Space = () => ['margin', 'padding', 'position', 'top', 'left', 'bottom', 'right']

const Size = () => [
  'width', 'height',
  'max-width', 'max-height',
  'min-width', 'min-height',
  'font-size'
]

/******************************************************************************/
// Fuckin Arond
/******************************************************************************/

const SomeButton = ({ className, style, primary, ...props }) => {

}

const ExamlePanel = () =>
  <Flex.Space.Size
    width='10em'
    min-height='8em'
    max-height='12em'
    align-items='center'
    flex-direction='row'
    flex-wrap
    margin='0em 1em 0em 1em'>
  </Flex.Space.Size>

/******************************************************************************/
// Exports
/******************************************************************************/

export { Flex, Space, Size }

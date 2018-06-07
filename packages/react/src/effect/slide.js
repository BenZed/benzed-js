import styled from 'styled-components'

import { observe } from './visible'
import { CssCloner } from '../util/cloner'

/******************************************************************************/
// Css Func
/******************************************************************************/

const translateInOut = props => {

  const { visibility: vis, down } = props

  const mult = down ? 1 : -1

  const y = vis === 'shown'
    ? 0
    : vis.includes('hid')
      ? 100 * mult
      : 100 * -mult

  return `translate(0%, ${y}%)`

}

/******************************************************************************/
// Effect
/******************************************************************************/

const Slide = styled(CssCloner)`

  transform: ${translateInOut};
  transition: transform 250ms;

`::observe()// ^^^ TEMP HACK implement the above with $ styler helper TODO

/******************************************************************************/
// Exports
/******************************************************************************/

export default Slide

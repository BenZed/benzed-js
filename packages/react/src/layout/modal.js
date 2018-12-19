import styled from 'styled-components'
import React from 'react'

import { Visible, Fade } from '../effect'
import { createPropTypesFor } from '@benzed/schema'

/******************************************************************************/
// Data
/******************************************************************************/

const Z = 1000

/******************************************************************************/
// Sub Components
/******************************************************************************/

const Backdrop = styled.div.attrs(props => {
  return {
    style: {
      zIndex: props.z,
      backgroundColor: `rgba(0,0,0,${props.opacity})`
    }
  }
})`
  position: ${props => props.position};
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  cursor: ${props =>
    props.onClick
      ? 'pointer'
      : 'default'};

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

`

/******************************************************************************/
// Modal
/******************************************************************************/

const Modal = ({ visible, children, ...rest }) =>

  <Visible visible={visible}>
    <Fade>
      <Backdrop {...rest}>
        {children}
      </Backdrop>
    </Fade>
  </Visible>

/******************************************************************************/
// Extend
/******************************************************************************/

Modal.defaultProps = {
  position: 'fixed',
  z: Z,
  opacity: 0.5
}

Modal.propTypes = createPropTypesFor(React =>
  <proptypes>
    <value key='position'>fixed absolute sticky</value>
    <bool key='visible' />
    <number key='opacity' range={[0, 1]} />
  </proptypes>
)

/******************************************************************************/
// Exports
/******************************************************************************/

export default Modal

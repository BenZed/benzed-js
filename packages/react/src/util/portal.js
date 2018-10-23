import React from 'react'
import { createPortal } from 'react-dom'
import { createPropTypesFor } from '@benzed/schema'

/******************************************************************************/
// Main
/******************************************************************************/

class Portal extends React.Component {

  static propTypes = createPropTypesFor(React => <proptypes>
    <string key='targetId' required />
  </proptypes>)

  state = {
    target: null
  }

  setTarget (props) {

    const { targetId } = props
    const target = document.getElementById(targetId)

    this.setState({
      target
    })
  }

  componentDidMount () {
    this.setTarget(this.props)
  }

  componentDidReceiveProps (props) {
    if (props.targetId !== this.props.targetId)
      this.setTarget(props)
  }

  render () {

    const { target } = this.state
    const { children } = this.props

    return target && createPortal(
      children,
      target
    )
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Portal

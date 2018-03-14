import React from 'react'
import styled from 'styled-components'

/******************************************************************************/
// Styles
/******************************************************************************/

const Page = styled.div`
  padding: 1em;
`

const Header = styled.h1`
  margin: 0;
`

class Count extends React.Component {

  componentDidMount () {

    const { counter } = this.props

    counter.subscribe(this.update, 'number')
  }

  componentWillUnmount () {
    const { counter } = this.props

    counter.unsubscribe(this.update)
  }

  update = value => {

    console.log(value)
    this.forceUpdate()

  }

  render () {

    const { number } = this.props.counter

    return <h1>{number}</h1>
  }

}

/******************************************************************************/
// Main
/******************************************************************************/

const Example = ({ counter }) =>
  <Page>

    <Header>BenZed React</Header>

    <Count counter={counter} />

  </Page>

/******************************************************************************/
// Exports
/******************************************************************************/

export default Example

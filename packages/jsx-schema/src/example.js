import Schema from './schema'

/******************************************************************************/
// Example
/******************************************************************************/

// @jsx Schema.create

const example = <json>

  <string key='name' required unique />

  <array key='scores' length={['>', 0]} required>
    <number range={[0, 5]} required/>
  </array>

</json>

/******************************************************************************/
// Exports
/******************************************************************************/

export default example

The Styler class is a syntax shortening class that creates style functions
for styled components.

You wouldn't instance a Styler directly. Instead, you'd create an interface
for one:
```js
import { Styler } from '@benzed/react'
import styled from 'styled-components'

const $ = Styler.createInterface()

const RedDiv = styled.div`
  background-color: ${$.prop('color')};
`
// <RedDiv color='red' /> will have a red background
```

The interface contains the same methods and properties that the class does,
and using those properties creates new instances of stylers:

```js
$.prop('hidden')
// equivalent to
new Styler().prop('hidden')
```

Interfaces can be created with a theme, which will add theme getters to
the resulting Styler.
```js
const theme = {
  bg: 'black',
  fg: 'white'
}

const $ = Styler.createInterface(theme)

const Section = styled.section`
  background-color: ${$.theme.bg};
  color: ${$.theme.fg};
`

// <Section /> will have be theme colored
```

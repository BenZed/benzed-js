# isEvent

Returns true if the passed argument is an object with a 'target' property

```js
import { isEvent } from '@benzed/react'

const notEvent = 'nope-just-a-string'
isEvent(notEvent) // false

const fakeEvent = { target: true }
isEvent(fakeEvent) // true

```

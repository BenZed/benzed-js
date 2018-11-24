The between function returns a subset of a string, that which exists between two delimeters.
```js
import { between } from '@benzed/string'

const text = between('<b>bold</b>', '<b>', '</b>')

console.log(text) // bold
```

Returns null if markers cannot be found:
```js
import { between } from '@benzed/string'

const text = between('Hello world!', '{', '}')

console.log(text) // null
```

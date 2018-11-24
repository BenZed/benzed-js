The flatten function takes an Array and decomposes any nested arrays.

```js
import { flatten } from '@benzed/array'

const flattened = flatten([1, [2], [3, [4]]])
console.log(flattened) // [1, 2, 3, 4]
```

Optionally bindable:

```js
const flattened = [1, [2]]::flatten()
console.log(flattened) // [1, 2]
```

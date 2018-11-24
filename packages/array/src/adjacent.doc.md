The adjacent function gets the neighbour of the supplied value in an array:
```js
import { adjacent } from '@benzed/array'

const next = adjacent([ 'one', 'two', 'three' ], 'one')
console.log(next) // 'two'
```

If the supplied value is at the end of the array, the returned value will
be wrapped around:  
```js
const first = adjacent([ 1, 2, 3, 4 ], 4)
console.log(first) // 1
```

Optionally takes a delta argument:
```js
const array = [ 'min', 1, 2, 3, 'max' ]
const two = adjacent(array, 'min', 2)
console.log(two) // 2

const min = adjacent(array, 'max', -4)
console.log(min) // 'min'
```

Optionally bindable:
```js
const three = [1,2,3]::adjacent(1, 2)
console.log(three) // 3
```

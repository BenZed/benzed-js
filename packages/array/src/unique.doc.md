
The shuffle function randomizes the order of an array.

Returns the Array, mutated in place.

```js
import { shuffle } from '@benzed/array'

const arr = [ 1, 2, 3, 4, 5, 6 ]
shuffle(arr)

console.log(arr) // will now be in a random order
```

Optionally Bindable:
```js
const arr = [ 1, 2, 3, 4, 5, 6 ]
arr::shuffle()
```

Also works on strings:
```js
const str = '1234578'
str::shuffle() // returns a randomized string
```

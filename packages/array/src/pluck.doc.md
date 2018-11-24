
The pluck function removes a number of items from an array that pass a test:
```js
import { pluck } from '@benzed/array'

const arr = [ 1, 2, 3, 4, 5, 6 ]
const even = pluck(arr, n => n % 2 === 0)

console.log(even) // [ 2, 4, 6 ]
console.log(arr) // [ 1, 3, 5 ]
```

The input array is mutated, and items that pass the test are returned in a new array.

Can also take a count argument, which maximizes the number of elements returned:
```js
const arr = [ 1, 2, 3, 4, 5, 6 ]
const firstTwoOdd = pluck(arr, n => n % 2 === 1, 2)

console.log(firstTwoOdd) // [ 1, 3 ]
console.log(arr) // [ 2, 4, 5, 6 ]
```

Pluck is also optionally bindable:
```js
const arr = [ 1, 2, 3, 4, 5, 6 ]
const odd = arr::pluck(n => n % 2 === 1)

console.log(odd) // [ 1, 3, 5 ]
console.log(arr) // [ 2, 4, 6 ]
```

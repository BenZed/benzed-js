<!--
@name = 'wrap'
-->

The wrap function ensures that a given value is an array. If it is not an
array, the value gets wrapped into one:
```js
import { wrap } from '@benzed/array'

const one = wrap(1)

console.log(one) // [1]
console.log(wrap(one)) // [1]
```

Optionally Bindable:
```js
1::wrap() // [1]
```

<!--
@name = 'unwrap'
-->

The unwrap function ensures that a given value is not an array. If it is an array,
the first element in the array is returned:
```js
import { unwrap } from '@benzed/array'

const one = unwrap([1])

console.log(one) // 1
console.log(unwrap(one)) // 1
```

Optionally Bindable:
```js
[1]::unwrap() // 1
```

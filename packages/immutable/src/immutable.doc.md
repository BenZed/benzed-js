# Immutable
---
### Why?

I look at libraries (namely *Immutable.js*) that solve immutability in javascript by defining a set of types with methods that spawn new instances.

It's a great solution, but there are things I don't like about it:

1) You can't use *js* `member-of` and `index` operators to access properties:
```js
const online = app.getIn([ 'users', 'onlineList' ]) // x
// vs
const { onlineList: online } = app.users // √
```

2) I find mixing immutable types with libraries that don't use immutable types messy.

3) I don't think it's a solution that takes advantage of the strengths of javascript.

---
### Immutable Operations

So far as immutability in javascript is concerned, all I want to be able to do is make a value-equal assignment of an object to a different declaration, as though I were doing it to a literal types:
```js
const five = 5
let variable = five
variable++

console.log(variable, five) // 5, 4
```

I believe a better solution than a series of types with
their own operations, is a set of operations that could be made to work with any type:
```js
import { copy } from '@benzed/immutable'

const foo = { bar: true }
const foo2 = copy(foo)

// Or, if you really really like the function bind operator as much as I do:
const foo2 = foo::copy()
foo2.bar = false

console.log(foo, foo2) // { bar: true }, { bar: false }
```

This works (deeply) for any built-in javascript type:
```js
const immutableCopiesOfAllTypes = copy({
  arrays: [ { and: 'anything' }, { in: 'them' } ],
  typedArrays: new Uint8Array(),
  dates: new Date(),
  collections: new Set([ new Map() ])
})

// none of the values in immutableCopiesOfAllTypes will be identical (pass ===) with their counterparts in the input
```

Note that values that are immutable by default (or can\'t be copied) just return themselves:
```js
const builtInImmutables = copy({
  function: () => {},
  symbols: Symbol(),
  regexp: /iKnowYouCanMakeACopyOfARegExpIfYouReallyWantedToButWhy/,
  string: 'already-immutable',
  bool: true,
  number: 0,
  null: null,
  undefined: undefined
})

// all of the values in immutableCopiesOfAllTypes will be identical (pass ===) with their counterparts in the input
```

Okay, great. What about custom types?

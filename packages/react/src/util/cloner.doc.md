# Cloner Component

Cloner is a component that passes it's props to each of it's children.

By default, it passes all props:

```js

const List = () =>
  <Cloner style={{ color: 'red' }}>
    <ul>1</ul>
    <ul>2</ul>
    <ul>2</ul>
  <Cloner/>

```

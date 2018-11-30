<!--
@path = ['app']
-->

# App

Apps can be declared by chaining app entities via jsx:

```js
import App from '@benzed/app'

// @jsx App.declareEntity

const app = <app>
  <rest />
</app>

App.start(app)
```

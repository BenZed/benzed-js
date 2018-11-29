<!--
@name = 'data-form'
-->

# Data Form Components

Form components are for inputting data.

The components here are opinionated, but low level enough that they should be
able to be mutated for any purpose.

```js
import { Form } from '@benzed/react'

const form = <Form>
  <Form.String value={value} onChange={onChange} placeholder='age' />
  <Form.Number />
</Form>

```

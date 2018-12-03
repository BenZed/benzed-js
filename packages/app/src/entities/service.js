import is from 'is-explicit'
import { isService } from '../util'
import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars

/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Validators
/******************************************************************************/

const validateOptions = <object key='config' plain>
  <string key='name' length={['>', 0]} required />
  <string key='path' default={ctx => `/${ctx.value?.name}`} />
  <string key='id' default='_id' />
</object>

/******************************************************************************/
// Helper
/******************************************************************************/

const buildService = (mutators, context, index = 0) => {

  for (let i = index; i < mutators.length; i++) {
    const mutator = mutators[i]
    const result = mutator(context)

    if (is(result, Promise))
      return result.then(resolved => {

        if (is.defined(resolved))
          context = resolved

        return buildService(mutators, context, i + 1)
      })

    else if (is.defined(result))
      context = result
  }
}

function useService (path) {

  const app = this

  return service => {

    const { _hooksToAdd } = service
    delete service._hooksToAdd

    // if there was no adapter up the line, this object will still just be a config
    if (!isService(service)) {
      const { Service: MemoryService } = require('feathers-memory')

      service = new MemoryService(service)
    }

    app.use(path, service)

    service = app.service(path)
    service._hooksToAdd = _hooksToAdd

    return service
  }
}

const applyHooks = input => {

  const hooks = input._hooksToAdd
  delete input._hooksToAdd

  if (hooks) for (const group of hooks)
    input.hooks(group)

  return input

}

/******************************************************************************/
// Main
/******************************************************************************/

const service = props => {

  const { children, ...options } = props

  const { path, name, id } = validateOptions(options)

  return app => {

    const mutators = [
      ...children || [],
      app::useService(path),
      applyHooks
    ]

    return buildService(mutators, { name, id })

  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default service

export { applyHooks }

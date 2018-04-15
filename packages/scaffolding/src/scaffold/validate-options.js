import Schema from 'feathers-schema'

import { prompt } from 'inquirer'
import is from 'is-explicit'

/******************************************************************************/
// Validation
/******************************************************************************/

const required = true

const PASS = false

const requiresApi = () => (value, { data }) => value && !data.api ? 'Must have a Api' : PASS

const requiresUi = () => (value, { data }) => value && !data.ui ? 'Must have a Ui' : PASS

const requiredIfLiveEditing = () => (value, { data }) => !value && data.liveEditing
  ? 'Required if liveEditing is enabled'
  : PASS

const requiredIfUsesDataAndNo = other =>
  () => (value, { data }) =>
    data.api &&
    (data.files || data.liveEditing || data.auth) &&
    !value &&
    !data[other]
      ? `Must be enabled if ${other} is disabled`
      : PASS

const optionSchema = new Schema({

  name: {
    type: String,
    required,
    format: /[a-z]|-/,
    length: [ '>=', 4 ],
    default: 'new-project'
  },

  ui: { type: Boolean, required, default: false },
  api: { type: Boolean, required, default: false },

  rest: {
    type: Boolean,
    required,
    default: false,
    validate: [requiresApi, requiredIfUsesDataAndNo('socketio')]
  },

  socketio: {
    type: Boolean,
    required,
    default: false,
    validate: [requiresApi, requiredIfUsesDataAndNo('rest'), requiredIfLiveEditing]
  },

  auth: {
    type: Boolean,
    required,
    default: false,
    validate: requiresApi
  },

  files: {
    type: Boolean,
    required,
    default: false,
    validate: requiresApi
  },

  liveEditing: {
    type: Boolean,
    required,
    default: false,
    validate: requiresUi
  },

  routing: {
    type: Boolean,
    required,
    default: false,
    validate: requiresUi
  }

})

/******************************************************************************/
// Helper
/******************************************************************************/

async function askName (input) {
  const answer = await prompt([
    {
      type: 'input',
      name: 'name',
      message: 'project name',
      validate: input => /[a-z]|-/.test(input)
        ? input.length > 3
          ? true
          : 'must be at least 4 characters'
        : 'lowercase and dash characters only'
    }
  ])

  input.name = answer.name
}

async function askScope (input) {

  const answer = await prompt([
    {
      type: 'checkbox',
      name: 'scope',
      message: 'will this project require...',
      choices: [ 'api', 'ui' ]
    }
  ])

  input.api = answer.scope.includes('api')
  input.ui = answer.scope.includes('ui')

}

async function askFeatures (input) {

  if (input.api) {
    const answers = await prompt([
      {
        type: 'confirm',
        name: 'auth',
        message: 'will the api require authentication'
      },
      {
        type: 'confirm',
        name: 'files',
        message: 'will the api have file management'
      }
    ])

    input.auth = answers.auth
    input.files = answers.files
  }

  if (input.api && input.ui) {
    const answer = await prompt({
      type: 'confirm',
      name: 'liveEditing',
      message: 'include live editing'
    })

    input.liveEditing = answer.liveEditing
  }

  if (input.api) {
    const d = []
    if (input.liveEditing)
      d.push('socket.io')
    if (d.length === 0 && (input.files || input.auth))
      d.push('rest')
    const answer = await prompt({
      type: 'checkbox',
      name: 'providers',
      message: 'which providers will this api have',
      choices: [ 'rest', 'socketio' ],
      default: d,
      validate: v => v.length === 0 &&
      (input.files || input.auth)
        ? 'If using auth or files, must have at least one provider.'
        : input.liveEditing && !v.includes('socketio')
          ? 'liveEdit requires socket.io'
          : false
    })
    input.rest = answer.providers.includes('rest')
    input.socketio = answer.providers.includes('socketio')
  }

  if (input.ui) {
    const answer = await prompt({
      type: 'confirm',
      name: 'routing',
      message: 'include routing'
    })

    input.routing = answer.routing
  }

}

class ValidationError extends Error {

  name = 'ValidationError'

  constructor (obj) {
    let str = ''
    for (const key in obj) {
      str = `${key} - ${obj[key]}`
      break
    }

    super(str)
  }

}

/******************************************************************************/
// Main
/******************************************************************************/

async function validateOptions (input, flags) {

  const scaffolding = this

  try {
    if (!is.plainObject(input)) {
      input = {}

      await askName(input)
      await askScope(input)
      await askFeatures(input)
    }

    const options = await optionSchema.sanitize(input)
    const errors = await optionSchema.validate(options)
    if (errors)
      throw new ValidationError(errors)

    scaffolding.options = options
    console.log({ options })

  } catch (err) {
    throw err
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default validateOptions

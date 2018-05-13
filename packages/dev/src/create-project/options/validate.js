import { object, Schema, string, bool, required, defaultTo } from '@benzed/schema'

/******************************************************************************/
// Shortcuts
/******************************************************************************/

const defaultToEmpty = defaultTo(() => Object({}))

const mustBeEnabled = other =>
  (value, ctx) => {
    return value === true && !ctx.data[other]
      ? new Error(`requires ${other} to be enabled.`)
      : value
  }

/******************************************************************************/
// Main
/******************************************************************************/

const validateOptions = new Schema(
  object({
    dir:      string(required),
    name:     string(required),
    api:      bool(defaultTo(false)),
    socketio: bool(defaultTo(false)),
    rest:     bool(defaultTo(false)),
    auth:     bool(defaultTo(false), mustBeEnabled('api')),
    files:    bool(defaultTo(false), mustBeEnabled('api')),
    ui:       bool(defaultTo(false)),
    routing:  bool(defaultTo(false), mustBeEnabled('ui'))
  },
  defaultToEmpty)
)

/******************************************************************************/
// Exports
/******************************************************************************/

export default validateOptions

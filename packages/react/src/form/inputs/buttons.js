import React from 'react'

import useForm from '../use-form'
import { useStateTree } from '../../util'

/******************************************************************************/
// Main
/******************************************************************************/

const Buttons = props => {

  const {
    children,
    schema, // not used, do not send to dom
    ...rest
  } = props

  const form = useForm()

  useStateTree.observe(form)

  const canSave = form.hasChangesToUpstream && !form.isPushingUpstream
  const canTraverseHistory = form.config.historyMaxCount > 1

  return <div {...rest}>
    <button
      type='submit'
      data-type='save'
      disabled={!canSave}
    >
      {form.isPushingUpstream ? 'Saving' : 'Save'}
    </button>

    <button
      disabled={!canSave}
      data-type='cancel'
      onClick={e => {
        e.preventDefault()
        form.revertToUpstream()
      }}
    >
      {form.upstreamTimestamp > form.currentTimestamp
        ? 'Revert'
        : 'Cancel'
      }
    </button>

    {
      canTraverseHistory
        ? <button
          disabled={!form.canUndoEditCurrent}
          data-type='undo'
          onClick={e => {
            e.preventDefault()
            form.undoEditCurrent()
          }}>
          Undo
        </button>
        : null
    }

    {
      canTraverseHistory
        ? <button
          disabled={!form.canRedoEditCurrent}
          data-type='redo'
          onClick={e => {
            e.preventDefault()
            form.redoEditCurrent()
          }}>
          Redo
        </button>
        : null
    }

    { children }

  </div>
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Buttons

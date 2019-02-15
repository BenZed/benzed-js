import React from 'react'

import useForm from '../use-form'
import useStateTree from '../../state-tree-observer/use-state-tree'

/******************************************************************************/
// Main
/******************************************************************************/

const Buttons = props => {

  const form = useForm()
  useStateTree.observe(form)

  const canSave = form.hasChangesToUpstream && !form.isPushingUpstream
  const canTraverseHistory = form.config.historyMaxCount > 1

  return <div {...props}>
    <button
      type='submit'
      disabled={!canSave}
    >
      {form.isPushingUpstream ? 'Saving' : 'Save'}
    </button>

    <button
      disabled={!canSave}
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
          onClick={e => {
            e.preventDefault()
            form.redoEditCurrent()
          }}>
          Redo
        </button>
        : null
    }

  </div>
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default Buttons

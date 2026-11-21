import { useEffect, useRef } from 'react'
import { ModalActions, ModalButton, ModalDialog, ModalOverlay } from './ModalPrimitives'

export function FailureModal({ message, onCancel, onOkay }) {
  const cancelButtonRef = useRef(null)

  useEffect(() => {
    cancelButtonRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return (
    <ModalOverlay
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <ModalDialog role="alertdialog" aria-modal="true" aria-labelledby="failure-title" aria-describedby="failure-message">
        <h2 id="failure-title">Check could not continue</h2>
        <p id="failure-message">{message}</p>
        <ModalActions>
          <ModalButton ref={cancelButtonRef} type="button" onClick={onCancel}>Cancel</ModalButton>
          <ModalButton $primary type="button" onClick={onOkay}>Okay</ModalButton>
        </ModalActions>
      </ModalDialog>
    </ModalOverlay>
  )
}

import { useEffect, useRef } from 'react'
import { ModalActions, ModalButton, ModalDialog, ModalOverlay } from './ModalPrimitives'

export function RiskWarningModal({ onCancel, onProceed }) {
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
      <ModalDialog $tone="danger" role="alertdialog" aria-modal="true" aria-labelledby="risk-warning-title" aria-describedby="risk-warning-message">
        <h2 id="risk-warning-title">Pause before you proceed</h2>
        <p id="risk-warning-message">
          You are about to start a game. It involves financial risk; think twice before proceeding.
        </p>
        <ModalActions>
          <ModalButton ref={cancelButtonRef} type="button" onClick={onCancel}>Go back</ModalButton>
          <ModalButton $primary $tone="danger" type="button" onClick={onProceed}>I understand, proceed</ModalButton>
        </ModalActions>
      </ModalDialog>
    </ModalOverlay>
  )
}

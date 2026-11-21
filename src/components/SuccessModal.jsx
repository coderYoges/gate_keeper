import { useEffect, useRef } from 'react'
import { ModalActions, ModalButton, ModalDialog, ModalOverlay } from './ModalPrimitives'

export function SuccessModal({ message, onOkay }) {
  const okayButtonRef = useRef(null)

  useEffect(() => {
    okayButtonRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onOkay()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onOkay])

  return (
    <ModalOverlay
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOkay()
      }}
    >
      <ModalDialog role="dialog" aria-modal="true" aria-labelledby="success-title" aria-describedby="success-message">
        <h2 id="success-title">Checks passed</h2>
        <p id="success-message">{message}</p>
        <ModalActions>
          <ModalButton ref={okayButtonRef} $primary type="button" onClick={onOkay}>Okay</ModalButton>
        </ModalActions>
      </ModalDialog>
    </ModalOverlay>
  )
}

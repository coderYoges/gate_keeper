import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { ModalActions, ModalButton, ModalDialog, ModalOverlay } from './ModalPrimitives'

const FailureDialog = styled(ModalDialog)`
  width: min(520px, 100%);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
`

const FailureMessage = styled.p`
  padding: 12px 14px;
  border-left: 3px solid #f09a8e;
  border-radius: 6px;
  background: #2b1d1b;
  color: #ffd0c9 !important;
  font-size: 14px !important;
  font-weight: 700;
`

const SafetyGuidance = styled.div`
  margin-top: 15px;
  padding: 14px;
  border: 1px solid #34463a;
  border-radius: 8px;
  background: #1a251e;

  p {
    color: #c4cec7;
  }
`

const SafetyList = styled.ul`
  display: grid;
  gap: 9px;
  margin: 10px 0 0;
  padding-left: 19px;
  color: #c4cec7;
  font-size: 12px;
  line-height: 1.55;

  li::marker {
    color: #c8f169;
  }

  strong {
    color: #edf3ef;
  }

  .risk {
    color: #f09a8e;
  }

  .choice {
    color: #c8f169;
  }
`

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
      <FailureDialog $tone="danger" role="alertdialog" aria-modal="true" aria-labelledby="failure-title" aria-describedby="failure-message failure-safety-note">
        <h2 id="failure-title">Check could not continue</h2>
        <FailureMessage id="failure-message">{message}</FailureMessage>
        <SafetyGuidance id="failure-safety-note">
          <p>Dear user, please keep these important points in mind:</p>
          <SafetyList>
            <li><strong>Your actions are not in accordance with the rules</strong> and may expose you to <strong className="risk">significant financial risk</strong>.</li>
            <li>Our security checks exist to prevent such situations and safeguard your well-being.</li>
            <li><strong className="choice">Choosing not to move forward is acceptable.</strong> Please do not jeopardize your safety or stability.</li>
          </SafetyList>
        </SafetyGuidance>
        <ModalActions>
          <ModalButton ref={cancelButtonRef} type="button" onClick={onCancel}>Cancel</ModalButton>
          <ModalButton $primary $tone="danger" type="button" onClick={onOkay}>Okay</ModalButton>
        </ModalActions>
      </FailureDialog>
    </ModalOverlay>
  )
}

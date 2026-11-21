import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { ModalActions, ModalButton, ModalDialog, ModalOverlay } from './ModalPrimitives'

const RiskDialog = styled(ModalDialog)`
  width: min(540px, 100%);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
`

const RiskMessage = styled.p`
  margin-bottom: 12px !important;
`

const RiskList = styled.ul`
  display: grid;
  gap: 10px;
  margin: 0;
  padding-left: 20px;
  color: #c4cec7;
  font-size: 12px;
  line-height: 1.55;

  li::marker {
    color: #f09a8e;
  }

  strong {
    color: #edf3ef;
  }
`

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
      <RiskDialog $tone="danger" role="alertdialog" aria-modal="true" aria-labelledby="risk-warning-title" aria-describedby="risk-warning-message">
        <h2 id="risk-warning-title">Pause before you proceed</h2>
        <RiskMessage id="risk-warning-message">
          You are about to start a game involving financial risk. Please review these safeguards before deciding:
        </RiskMessage>
        <RiskList>
          <li><strong>Do not borrow or take loans to play.</strong> A win is never guaranteed, and debt can put your future financial stability at risk.</li>
          <li><strong>Follow all security measures</strong> and do not bypass or work around the rules.</li>
          <li><strong>Stay within the stated rules and limits.</strong> Do not take actions outside the approved process.</li>
          <li>You may already be in a good place financially; do not risk your well-being or stability for a game.</li>
          <li>Think of these security checks as safeguards intended to protect you. Pause or stop if they indicate a concern.</li>
          <li><strong>A 7% agent bonus does not guarantee a profit or break-even result.</strong> Do not increase play or chase losses to recover money or qualify for a bonus.</li>
          <li>It is not “now or never.” Take your time and build stability gradually; choosing not to play is always okay.</li>
        </RiskList>
        <ModalActions>
          <ModalButton ref={cancelButtonRef} type="button" onClick={onCancel}>Go back</ModalButton>
          <ModalButton $primary $tone="danger" type="button" onClick={onProceed}>I understand, proceed</ModalButton>
        </ModalActions>
      </RiskDialog>
    </ModalOverlay>
  )
}

import styled from 'styled-components'
import {
  PanelDescription,
  PanelHeading,
  PanelKicker,
  PanelTitle,
  ErrorMessage,
} from './FormPrimitives'
import { SLOT_STAKE_AMOUNTS_BY_GAME } from '../constants'
import { getTotalReturnedAmount } from '../utils/sessionCalculations'

const ReviewList = styled.dl`
  margin: 0;
  border-top: 1px solid #26332c;
`

const ReviewRow = styled.div`
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid #26332c;
`

const ReviewLabel = styled.dt`
  color: #93a098;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.65px;
`

const ReviewValue = styled.dd`
  margin: 0;
  color: #dde5df;
  font-size: 12px;
  font-weight: 600;
  text-align: right;
`

const ReturnLimitCard = styled.aside`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 16px;
  padding: 14px 16px;
  border: 1px solid #688b40;
  border-radius: 9px;
  background: rgb(200 241 105 / 8%);

  strong {
    display: block;
    color: #d7f58e;
    font-size: 12px;
  }

  p {
    margin: 5px 0 0;
    color: #a8b69e;
    font-size: 11px;
  }

  @media (max-width: 480px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }
`

const ReturnLimitAmount = styled.span`
  flex: 0 0 auto;
  color: #c8f169;
  font-size: 20px;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
`

const AgentAmountField = styled.label`
  display: grid;
  gap: 7px;
  margin-top: 14px;
  color: #cbd5cd;
  font-size: 11px;
  font-weight: 700;

  small {
    color: #9aa79f;
    font-size: 10px;
    font-weight: 400;
  }
`

const AgentAmountInput = styled.input`
  width: min(260px, 100%);
  min-height: 40px;
  padding: 0 11px;
  border: 1px solid #536447;
  border-radius: 7px;
  background: #111915;
  color: #edf3ef;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
`

const ReviewContinueButton = styled.button`
  min-height: 39px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 16px 0 0 auto;
  padding: 0 16px;
  border: 1px solid #c8f169;
  border-radius: 7px;
  background: #c8f169;
  color: #17231e;
  font-size: 12px;
  font-weight: 650;

  &:hover:not(:disabled) {
    background: #d7f58e;
  }

  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`

export function ReviewStep({ playerIds, values, onChange, outcome, onContinue, continueDisabled, saving, saveError }) {
  const player = playerIds.find((item) => item.playerId === values.playerId)
  const amountReturned = getTotalReturnedAmount(values.completedGames || [])
  const maximumAgentReturn = amountReturned * 0.5
  const replenishedAgentAmount = values.replenishedAgentAmount === ''
    ? String(maximumAgentReturn)
    : values.replenishedAgentAmount
  const agentAmountNumber = Number(replenishedAgentAmount)
  const agentAmountError = !Number.isFinite(agentAmountNumber) || agentAmountNumber < 0
    ? 'Enter a valid non-negative amount.'
    : agentAmountNumber > maximumAgentReturn
      ? 'The agent amount cannot exceed 50% of the amount returned.'
      : ''
  const completedSlotStages = (values.slotStageResults || []).filter((stage) => stage.status !== 'pending').length
  const totalSlotStages = SLOT_STAKE_AMOUNTS_BY_GAME[values.gameName]?.length || 0
  const gamePlan = {
    slots: `Slots (${values.gameName}): ${completedSlotStages}/${totalSlotStages} stake stages tracked`,
    roulette: `Roulette (${values.gameName}): base amount ₹${values.rouletteBase || '—'}`,
  }[values.gameType] || ((values.completedGames || []).length
    ? `${values.completedGames.length} game records saved`
    : '—')

  return (
    <section aria-labelledby="review-heading">
      <PanelHeading>
        <PanelKicker>STEP 04 <span>—</span> FINAL REVIEW</PanelKicker>
        <PanelTitle id="review-heading">Review your session plan.</PanelTitle>
        <PanelDescription>Confirm the session details and review your stop limits before starting the session.</PanelDescription>
      </PanelHeading>
      <ReviewList>
        <ReviewRow><ReviewLabel>PLAYER</ReviewLabel><ReviewValue>{player?.playerName || '—'}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewLabel>PLAYER ID</ReviewLabel><ReviewValue>{player?.playerId || '—'}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewLabel>EMAIL</ReviewLabel><ReviewValue>{player?.email || '—'}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewLabel>LOCATION</ReviewLabel><ReviewValue>{player?.location || '—'}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewLabel>DEVICE</ReviewLabel><ReviewValue>{player?.deviceName || '—'}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewLabel>CONNECTION</ReviewLabel><ReviewValue>{values.mobileDataConfirmed ? 'Mobile data only' : 'Not confirmed'}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewLabel>SIM CARD</ReviewLabel><ReviewValue>{values.differentSimConfirmed ? 'Different from previous user' : 'Not confirmed'}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewLabel>CURRENT SESSION TODAY</ReviewLabel><ReviewValue>{values.sessionsToday}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewLabel>EXISTING ACCOUNT BALANCE</ReviewLabel><ReviewValue>{values.existingBalance ? 'Yes' : 'No'}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewLabel>SESSION DEPOSIT</ReviewLabel><ReviewValue>₹{values.depositAmount || '—'}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewLabel>COOLING-PERIOD CHECK</ReviewLabel><ReviewValue>{values.cooldownConfirmed ? 'Clear based on saved sessions' : 'Not clear'}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewLabel>GAME PLAN</ReviewLabel><ReviewValue>{gamePlan}</ReviewValue></ReviewRow>
      </ReviewList>
      <ReturnLimitCard role="note" aria-label="Maximum return to agent account">
        <div>
          <strong>Maximum to take back to agent account</strong>
          <p>50% of amount returned ({`₹${amountReturned.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`})</p>
        </div>
        <ReturnLimitAmount>{`₹${maximumAgentReturn.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}</ReturnLimitAmount>
      </ReturnLimitCard>
      <AgentAmountField htmlFor="replenished-agent-amount">
        Replenished agent amount
        <AgentAmountInput
          id="replenished-agent-amount"
          name="replenishedAgentAmount"
          type="number"
          min="0"
          max={maximumAgentReturn}
          step="0.01"
          value={replenishedAgentAmount}
          onChange={onChange}
          aria-invalid={Boolean(agentAmountError)}
          aria-describedby="replenished-agent-amount-hint"
        />
        <small id="replenished-agent-amount-hint">Defaults to the maximum; edit any amount up to 50% of amount returned.</small>
        {agentAmountError && <ErrorMessage role="alert">{agentAmountError}</ErrorMessage>}
      </AgentAmountField>
      {saveError && <ErrorMessage role="alert">{saveError}</ErrorMessage>}
      <ReviewContinueButton type="button" onClick={onContinue} disabled={continueDisabled || Boolean(agentAmountError)}>
        {saving ? 'Saving session…' : 'Save session'} <span aria-hidden="true">→</span>
      </ReviewContinueButton>
    </section>
  )
}

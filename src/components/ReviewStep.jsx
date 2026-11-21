import styled from 'styled-components'
import {
  PanelDescription,
  PanelHeading,
  PanelKicker,
  PanelTitle,
} from './FormPrimitives'
import { SESSION_RULES } from '../constants'

const ReviewList = styled.dl`
  margin: 0;
  border-top: 1px solid #edf0ec;
`

const ReviewRow = styled.div`
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid #edf0ec;
`

const ReviewLabel = styled.dt`
  color: #929b93;
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 0.65px;
`

const ReviewValue = styled.dd`
  margin: 0;
  color: #344039;
  font-size: 11px;
  font-weight: 600;
  text-align: right;
`

const RiskSummary = styled.div`
  display: grid;
  gap: 10px;
  margin-top: 15px;
`

const RiskSummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 12px;
  border: 1px solid #e4e9e1;
  border-radius: 8px;
  background: #f8faf6;

  strong {
    color: #3e4b40;
    font-size: 10px;
  }

  span {
    color: #7d887e;
    font-size: 10px;
    text-align: right;
  }
`

const Outcome = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 11px;
  margin-top: 16px;
  padding: 13px;
  border: 1px solid ${({ $error }) => ($error ? '#f0dfc8' : '#d9e8ca')};
  border-radius: 8px;
  background: ${({ $error }) => ($error ? '#fff8ef' : '#f3f8ee')};
  animation: panel-in 180ms ease both;
`

const OutcomeIcon = styled.span`
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: ${({ $error }) => ($error ? '#f7e9d7' : '#e0edcf')};
  color: ${({ $error }) => ($error ? '#a46b2d' : '#507b2e')};
  font-size: 12px;
  font-weight: 800;
`

const OutcomeCopy = styled.div`
  strong {
    color: ${({ $error }) => ($error ? '#9a682e' : '#4f7435')};
    font-size: 9px;
    letter-spacing: 0.8px;
  }

  p {
    margin: 4px 0 0;
    color: #69756a;
    font-size: 10px;
    line-height: 1.5;
  }
`

export function ReviewStep({ values, outcome, cooldownStatus }) {
  const gamePlan = {
    slots: `Slots: ${values.slotGames} games at ${values.slotBet ? `₹${values.slotBet}` : '—'} each`,
    roulette: `Roulette: base amount ₹${values.rouletteBase || '—'}`,
    both: `Slots: ${values.slotGames} games at ₹${values.slotBet} each; roulette: ₹${values.rouletteBase}`,
  }[values.gameType] || '—'

  const deposit = Number(values.depositAmount)
  const stopLoss = Number.isFinite(deposit) ? (deposit * SESSION_RULES.stopLossPercent).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '0'

  return (
    <section aria-labelledby="review-heading">
      <PanelHeading>
        <PanelKicker>STEP 04 <span>—</span> FINAL REVIEW</PanelKicker>
        <PanelTitle id="review-heading">Review your session plan.</PanelTitle>
        <PanelDescription>Confirm the session details and review your stop limits before starting the demo session.</PanelDescription>
      </PanelHeading>
      <ReviewList>
        <ReviewRow><ReviewLabel>PLAYER ID</ReviewLabel><ReviewValue>{values.playerId || '—'}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewLabel>SESSIONS TODAY</ReviewLabel><ReviewValue>{values.sessionsToday}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewLabel>SESSION DEPOSIT</ReviewLabel><ReviewValue>₹{values.depositAmount || '—'}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewLabel>LAST PLAYED</ReviewLabel><ReviewValue>{cooldownStatus.tone === 'clear' ? 'Cooling period clear' : cooldownStatus.tone === 'cooling' ? 'Cooling period active' : 'Not verified'}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewLabel>GAME PLAN</ReviewLabel><ReviewValue>{gamePlan}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewLabel>PLAYER POSITION</ReviewLabel><ReviewValue>{values.positionConfirm ? 'Confirmed' : '—'}</ReviewValue></ReviewRow>
      </ReviewList>
      <RiskSummary>
        <RiskSummaryItem><strong>STOP LOSS</strong><span>Exit above 50% loss (₹{stopLoss})</span></RiskSummaryItem>
        <RiskSummaryItem><strong>STOP WIN</strong><span>Exit at ₹{SESSION_RULES.stopWin.toLocaleString('en-IN')} profit</span></RiskSummaryItem>
      </RiskSummary>
      {outcome && (
        <Outcome role="status" aria-live="polite" $error={outcome.type === 'error'}>
          <OutcomeIcon $error={outcome.type === 'error'} aria-hidden="true">{outcome.type === 'error' ? '!' : '✓'}</OutcomeIcon>
          <OutcomeCopy $error={outcome.type === 'error'}>
            <strong>{outcome.type === 'error' ? 'SESSION NOT RECORDED' : 'CHECKS PASSED'}</strong>
            <p>{outcome.message}</p>
          </OutcomeCopy>
        </Outcome>
      )}
    </section>
  )
}

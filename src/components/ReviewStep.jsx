import styled from 'styled-components'
import {
  Checkbox,
  ChoiceCard,
  ErrorMessage,
  PanelDescription,
  PanelHeading,
  PanelKicker,
  PanelTitle,
} from './FormPrimitives'

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

const RiskChecks = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 15px;
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

export function ReviewStep({ values, errors, outcome, cooldownStatus, onChange }) {
  const gamePlan = {
    slots: `Slots: ${values.slotGames} games at ${values.slotBet ? `₹${values.slotBet}` : '—'} each`,
    roulette: `Roulette: base amount ₹${values.rouletteBase || '—'}`,
    both: `Slots: ${values.slotGames} games at ₹${values.slotBet} each; roulette: ₹${values.rouletteBase}`,
  }[values.gameType] || '—'

  const deposit = Number(values.depositAmount)
  const stopLoss = Number.isFinite(deposit) ? (deposit * 0.5).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '0'

  return (
    <section aria-labelledby="review-heading">
      <PanelHeading>
        <PanelKicker>STEP 04 <span>—</span> RISK MANAGEMENT</PanelKicker>
        <PanelTitle id="review-heading">Know when to stop.</PanelTitle>
        <PanelDescription>Review your plan and confirm your stop limits before starting the demo session.</PanelDescription>
      </PanelHeading>
      <ReviewList>
        <ReviewRow><ReviewLabel>PLAYER ID</ReviewLabel><ReviewValue>{values.playerId || '—'}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewLabel>SESSIONS TODAY</ReviewLabel><ReviewValue>{values.sessionsToday}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewLabel>SESSION DEPOSIT</ReviewLabel><ReviewValue>₹{values.depositAmount || '—'}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewLabel>LAST PLAYED</ReviewLabel><ReviewValue>{cooldownStatus.tone === 'clear' ? 'Cooling period clear' : cooldownStatus.tone === 'cooling' ? 'Cooling period active' : 'Not verified'}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewLabel>GAME PLAN</ReviewLabel><ReviewValue>{gamePlan}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewLabel>PLAYER POSITION</ReviewLabel><ReviewValue>{values.positionConfirm ? 'Confirmed' : '—'}</ReviewValue></ReviewRow>
      </ReviewList>
      <RiskChecks>
        <ChoiceCard>
          <Checkbox id="stop-loss-check" name="stopLossCheck" checked={values.stopLossCheck} onChange={onChange} aria-invalid={Boolean(errors.stopLossCheck)} />
          <span>
            <strong>Stop loss</strong>
            <small>Stop and exit if losses exceed 50% of your session deposit (₹{stopLoss}).</small>
            {errors.stopLossCheck && <ErrorMessage>{errors.stopLossCheck}</ErrorMessage>}
          </span>
        </ChoiceCard>
        <ChoiceCard>
          <Checkbox id="stop-win-check" name="stopWinCheck" checked={values.stopWinCheck} onChange={onChange} aria-invalid={Boolean(errors.stopWinCheck)} />
          <span>
            <strong>Stop win</strong>
            <small>Stop and exit once your profit reaches ₹1,000.</small>
            {errors.stopWinCheck && <ErrorMessage>{errors.stopWinCheck}</ErrorMessage>}
          </span>
        </ChoiceCard>
      </RiskChecks>
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

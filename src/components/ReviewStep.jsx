import styled from 'styled-components'
import {
  PanelDescription,
  PanelHeading,
  PanelKicker,
  PanelTitle,
} from './FormPrimitives'
import { PLAYER_IDS, SESSION_RULES } from '../constants'

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

const RiskSummary = styled.div`
  display: grid;
  gap: 10px;
  margin-top: 10px;
`

const RiskSummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 12px;
  border: 1px solid #303d35;
  border-radius: 8px;
  background: #1a2420;

  strong {
    color: #d1dad3;
    font-size: 11px;
  }

  span {
    color: #99a49d;
    font-size: 11px;
    text-align: right;
  }
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

const Outcome = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 11px;
  margin-top: 16px;
  padding: 13px;
  border: 1px solid ${({ $error }) => ($error ? '#685436' : '#47613a')};
  border-radius: 8px;
  background: ${({ $error }) => ($error ? '#2b251a' : '#1e281b')};
  animation: panel-in 180ms ease both;
`

const OutcomeIcon = styled.span`
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: ${({ $error }) => ($error ? '#4a3822' : '#30432b')};
  color: ${({ $error }) => ($error ? '#d8bd89' : '#b1d28a')};
  font-size: 12px;
  font-weight: 800;
`

const OutcomeCopy = styled.div`
  strong {
    color: ${({ $error }) => ($error ? '#d8bd89' : '#b1d28a')};
    font-size: 9px;
    letter-spacing: 0.8px;
  }

  p {
    margin: 4px 0 0;
    color: #abb6ae;
    font-size: 10px;
    line-height: 1.5;
  }
`

export function ReviewStep({ values, outcome, onContinue, continueDisabled }) {
  const player = PLAYER_IDS.find((item) => item.playerId === values.playerId)
  const completedSlotStages = (values.slotStageResults || []).filter((stage) => stage.status !== 'pending').length
  const gamePlan = {
    slots: `Slots (${values.gameName}): ${completedSlotStages}/4 stake stages tracked`,
    roulette: `Roulette (${values.gameName}): base amount ₹${values.rouletteBase || '—'}`,
    both: `${values.gameName}: ${completedSlotStages}/4 slot stake stages; roulette base ₹${values.rouletteBase}`,
  }[values.gameType] || ((values.completedGames || []).length
    ? `${values.completedGames.length} game records saved`
    : '—')

  const deposit = Number(values.depositAmount)
  const stopLoss = Number.isFinite(deposit) ? (deposit * SESSION_RULES.stopLossPercent).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '0'

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
        <ReviewRow><ReviewLabel>CURRENT SESSION TODAY</ReviewLabel><ReviewValue>{values.sessionsToday}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewLabel>SESSION DEPOSIT</ReviewLabel><ReviewValue>₹{values.depositAmount || '—'}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewLabel>3-HOUR COOLING PERIOD</ReviewLabel><ReviewValue>{values.cooldownConfirmed ? 'Confirmed by you' : 'Not confirmed'}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewLabel>GAME PLAN</ReviewLabel><ReviewValue>{gamePlan}</ReviewValue></ReviewRow>
      </ReviewList>
      <RiskSummary>
        <RiskSummaryItem><strong>STOP LOSS</strong><span>Exit above 50% loss (₹{stopLoss})</span></RiskSummaryItem>
        <RiskSummaryItem><strong>STOP WIN</strong><span>Exit at ₹{SESSION_RULES.stopWin.toLocaleString('en-IN')} profit</span></RiskSummaryItem>
      </RiskSummary>
      <ReviewContinueButton type="button" onClick={onContinue} disabled={continueDisabled}>
        Continue <span aria-hidden="true">→</span>
      </ReviewContinueButton>
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

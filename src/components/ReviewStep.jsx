import styled from 'styled-components'
import {
  PanelDescription,
  PanelHeading,
  PanelKicker,
  PanelTitle,
} from './FormPrimitives'
import { PLAYER_IDS, SLOT_STAKE_AMOUNTS_BY_GAME } from '../constants'

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

export function ReviewStep({ values, outcome, onContinue, continueDisabled }) {
  const player = PLAYER_IDS.find((item) => item.playerId === values.playerId)
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
        <ReviewRow><ReviewLabel>3-HOUR COOLING PERIOD</ReviewLabel><ReviewValue>{values.cooldownConfirmed ? 'Confirmed by you' : 'Not confirmed'}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewLabel>GAME PLAN</ReviewLabel><ReviewValue>{gamePlan}</ReviewValue></ReviewRow>
      </ReviewList>
      <ReviewContinueButton type="button" onClick={onContinue} disabled={continueDisabled}>
        Continue <span aria-hidden="true">→</span>
      </ReviewContinueButton>
    </section>
  )
}

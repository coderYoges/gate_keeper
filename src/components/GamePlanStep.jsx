import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import { ModalActions, ModalButton, ModalDialog, ModalOverlay } from './ModalPrimitives'
import {
  CurrencyPrefix,
  ErrorMessage,
  Field,
  FieldGrid,
  FieldLabel,
  Hint,
  InlineNote,
  InputGroup,
  NoteIcon,
  PanelDescription,
  PanelHeading,
  PanelKicker,
  PanelTitle,
  RequiredTag,
  SelectInput,
  TextInput,
} from './FormPrimitives'
import {
  MAX_SLOT_GAMES_PER_SESSION,
  ROULETTE_GAME_NAMES,
  SESSION_RULES,
  SLOT_GAME_NAMES,
  SLOT_STAKE_AMOUNTS_BY_GAME,
  getSlotPlayStages,
} from '../constants'
import {
  getGameReturnedAmount,
  getRouletteInvestment,
  getSlotInvestment,
  getTotalReturnedAmount,
} from '../utils/sessionCalculations'
import { getSessionStopReason, getSessionStopStatus } from '../utils/sessionChecks'
import { getSlotStageBalances } from '../utils/slotCalculations'

const AutomaticLimits = styled.div`
  display: grid;
  grid-column: 1 / -1;
  gap: 8px;

  padding: 12px;
  border: 1px solid #303d35;
  border-radius: 8px;
  background: #1a2420;
`

const RiskLimitTitle = styled.h3`
  margin: 0;
  color: #d5ded7;
  font-size: 12px;
  font-weight: 650;
`

const AutomaticLimitRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #aab6ad;
  font-size: 11px;

  strong {
    color: #d5ded7;
    font-size: 12px;
  }
`

const ProfitProgress = styled.div`
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`

const ProfitProgressCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  padding: 14px;
  border: 1px solid #303d35;
  border-radius: 8px;
  background: #1a2420;

  > div:last-child {
    display: grid;
    gap: 5px;
  }

  strong {
    color: #d5ded7;
    font-size: 12px;
  }

  span {
    color: #aab6ad;
    font-size: 11px;
  }
`

const ProfitProgressRing = styled.div`
  position: relative;
  width: 86px;
  height: 86px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: conic-gradient(
    #c8f169 0 ${({ $progress }) => $progress}%,
    #344238 ${({ $progress }) => $progress}% 100%
  );

  &::before {
    position: absolute;
    inset: 7px;
    border-radius: 50%;
    background: #1a2420;
    content: '';
  }

  > div {
    position: relative;
    z-index: 1;
    display: grid;
    justify-items: center;
    gap: 2px;
  }

  strong {
    font-size: 11px;
  }

  small {
    color: #aab6ad;
    font-size: 8px;
  }
`

const BreakdownRing = styled.div`
  position: relative;
  width: 86px;
  height: 86px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: ${({ $hasAmount, $slotsPercent }) => ($hasAmount
    ? `conic-gradient(#c8f169 0 ${$slotsPercent}%, #67b4a1 ${$slotsPercent}% 100%)`
    : '#344238')};

  &::before {
    position: absolute;
    inset: 7px;
    border-radius: 50%;
    background: #1a2420;
    content: '';
  }

  > div {
    position: relative;
    z-index: 1;
    display: grid;
    justify-items: center;
    gap: 2px;
  }

  strong {
    color: #d5ded7;
    font-size: 11px;
  }

  small {
    color: #aab6ad;
    font-size: 8px;
  }
`

const PlayedGames = styled.div`
  display: grid;
  gap: 10px;
`

const PlayedGamesHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const PlayedGameRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
  align-items: end;
  gap: 10px;
  padding: 12px;
  border: 1px solid #303d35;
  border-radius: 8px;
  background: #1a2420;

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const SlotStageRow = styled.div`
  display: grid;
  grid-template-columns: minmax(120px, 1fr) repeat(3, minmax(120px, 1fr));
  align-items: end;
  gap: 10px;
  padding: 12px;
  border: 1px solid #303d35;
  border-radius: 8px;
  background: #1a2420;

  @media (max-width: 700px) {
    grid-template-columns: minmax(0, 1fr);
  }
`

const SlotStageDescription = styled.div`
  display: grid;
  gap: 5px;
  align-self: center;
  color: #aab6ad;
  font-size: 11px;

  strong {
    color: #d5ded7;
    font-size: 12px;
  }
`

const TransactionField = styled.label`
  min-width: 0;
  display: grid;
  gap: 6px;
  color: #d5ded7;
  font-size: 11px;
  font-weight: 650;
`

const TransactionButton = styled.button`
  min-height: 36px;
  padding: 0 11px;
  border: 1px solid #3a493f;
  border-radius: 7px;
  background: #202c25;
  color: #d5ded7;
  font-size: 11px;
  font-weight: 650;

  &:hover {
    background: #29382f;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

const RemoveSavedGameButton = styled(TransactionButton)`
  justify-self: end;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  padding: 0;
  border-color: #70433e;
  color: #f09a8e;

  &:hover {
    background: #2d1d1a;
  }

  svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.7;
  }
`

const UpdateSavedGameButton = styled(RemoveSavedGameButton)`
  border-color: #47613a;
  color: #b1d28a;

  &:hover {
    background: #1e281b;
  }
`

const SavedGameActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`

const AddPlayedGameButton = styled(TransactionButton)`
  justify-self: start;
  border-color: #668f45;
  color: #b1d28a;
`

const TrackerNotice = styled.p`
  margin: 0;
  padding: 10px 12px;
  border: 1px solid ${({ $warning }) => ($warning ? '#70433e' : '#47613a')};
  border-radius: 7px;
  background: ${({ $warning }) => ($warning ? '#2d1d1a' : '#1e281b')};
  color: ${({ $warning }) => ($warning ? '#f09a8e' : '#b1d28a')};
  font-size: 11px;
  line-height: 1.5;
`

const SavedGameDetails = styled.div`
  display: grid;
  grid-column: 1 / -1;
  gap: 8px;
  padding: 12px;
  border: 1px solid #303d35;
  border-radius: 8px;
  background: #1a2420;
`

const SavedGameRecord = styled.details`
  display: grid;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #303d35;

  > summary {
    cursor: pointer;
    color: #d5ded7;
    font-size: 12px;
  }

  > summary strong {
    color: #d5ded7;
    font-size: 12px;
  }
`

const SavedSlotDetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #aab6ad;
  font-size: 11px;

  strong {
    color: #d5ded7;
  }

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 4px;
  }
`

const PlayedGamesDialog = styled(ModalDialog)`
  width: min(920px, 100%);
  max-height: min(90vh, 760px);
  overflow-y: auto;

  ${PlayedGames} {
    margin-top: 16px;
  }
`

const StageBalanceSummary = styled.div`
  display: flex;
  grid-column: 1 / -1;
  flex-wrap: wrap;
  gap: 8px 18px;
  color: #aab6ad;
  font-size: 10px;
`

function formatBalance(amount) {
  return amount === null || !Number.isFinite(amount)
    ? '—'
    : `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(amount)}`
}

function formatCompactBalance(amount) {
  return `₹${new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(amount)}`
}

export function GamePlanStep({
  values,
  errors,
  onChange,
  onPlayedGameChange,
  onSlotStageChange,
  onAddSlotRecord,
  onAddRouletteRecord,
  onAddPlayedGame,
  onRemovePlayedGame,
  onRemoveCompletedGame,
  onEditCompletedGame,
  onCancelCompletedGameEdit,
}) {
  const [trackerOpen, setTrackerOpen] = useState(false)
  const closeTrackerButtonRef = useRef(null)
  const previousSelection = useRef({ gameType: values.gameType, gameName: values.gameName })
  const includeSlots = values.gameType === 'slots'
  const includeRoulette = values.gameType === 'roulette'
  const playedGames = values.playedGames || []
  const slotStageResults = values.slotStageResults || []
  const slotStakeAmounts = SLOT_STAKE_AMOUNTS_BY_GAME[values.gameName] || []
  const slotStages = slotStakeAmounts.map((amount) => ({ plays: 10, amounts: [amount] }))
  const completedGames = values.completedGames || []
  const completedSlotCount = completedGames.filter((game) => game.gameType === 'slots').length
  const lastCompletedGame = completedGames[completedGames.length - 1]
  const playedSlotNames = new Set(completedGames
    .filter((game, index) => (
      game.gameType === 'slots' && index !== values.editingCompletedGameIndex
    ))
    .map((game) => game.gameName))
  const playedRouletteNames = new Set(completedGames
    .filter((game, index) => (
      game.gameType === 'roulette' && index !== values.editingCompletedGameIndex
    ))
    .map((game) => game.gameName))
  const slotsMustWaitForRoulette = lastCompletedGame?.gameType === 'slots'
  const slotsUnavailable = completedGames.length === 0
    || completedSlotCount >= MAX_SLOT_GAMES_PER_SESSION
    || slotsMustWaitForRoulette
  const sessionStopReason = getSessionStopReason(completedGames, values.depositAmount)
  const slotStageBalances = getSlotStageBalances(
    slotStageResults,
    values.gameStartingBalance || values.depositAmount,
    values.gameName,
  )
  const lastPlayedGame = playedGames[playedGames.length - 1]
  const hasRecordedActivity = includeSlots
    ? slotStageResults.some((stage) => (
      stage.status !== 'pending' || stage.winInstance || stage.wonAmount || stage.finalBalance
    ))
    : (
      playedGames.some((game) => game.status !== 'pending' || Boolean(game.placed.trim()) || Boolean(game.amount))
      || Boolean(values.rouletteFinalBalance)
    )
  const gameModeSelectionDisabled = hasRecordedActivity || Boolean(sessionStopReason)
  const canAddPlayedGame = Boolean(values.gameName?.trim())
    && playedGames.length < 40
    && (!lastPlayedGame || (lastPlayedGame.status !== 'pending' && Boolean(lastPlayedGame.placed.trim())))
  const stopLoss = Number(values.depositAmount) * SESSION_RULES.stopLossPercent
  const stopLossAmount = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(stopLoss)
  const depositAmount = Number(values.depositAmount)
  const latestBalance = lastCompletedGame?.finalBalance
  const sessionBalance = latestBalance === '' || latestBalance === null || latestBalance === undefined
    ? depositAmount
    : Number(latestBalance)
  const sessionProfit = Number.isFinite(sessionBalance) && Number.isFinite(depositAmount)
    ? sessionBalance - depositAmount
    : 0
  const profitTarget = SESSION_RULES.stopWin
  const stopLossTarget = depositAmount * SESSION_RULES.stopLossPercent
  const profitReached = Math.max(0, Math.min(profitTarget, sessionProfit))
  const profitProgress = Math.max(0, Math.min(100, (sessionProfit / profitTarget) * 100))
  const lossReached = Math.max(0, -sessionProfit)
  const lossProgress = stopLossTarget > 0
    ? Math.max(0, Math.min(100, (lossReached / stopLossTarget) * 100))
    : 0
  const isEditingCompletedGame = Number.isInteger(values.editingCompletedGameIndex)
  const slotsInvested = completedGames
    .filter((game) => game.gameType === 'slots')
    .reduce((total, game) => total + getSlotInvestment(game.slotStageResults || [], game.gameName), 0)
    + (includeSlots ? getSlotInvestment(slotStageResults, values.gameName) : 0)
  const rouletteInvested = completedGames
    .filter((game) => game.gameType === 'roulette')
    .reduce((total, game) => total + getRouletteInvestment(game.playedGames || []), 0)
    + (includeRoulette ? getRouletteInvestment(playedGames) : 0)
  const totalInvested = slotsInvested + rouletteInvested
  const slotsInvestmentPercent = totalInvested > 0 ? (slotsInvested / totalInvested) * 100 : 0
  const slotsReturned = completedGames
    .filter((game) => game.gameType === 'slots')
    .reduce((total, game) => total + getGameReturnedAmount(game), 0)
    + (includeSlots
      ? getGameReturnedAmount({
        gameType: 'slots',
        startingBalance: values.gameStartingBalance || values.depositAmount,
        slotStageResults,
      })
      : 0)
  const rouletteReturned = completedGames
    .filter((game) => game.gameType === 'roulette')
    .reduce((total, game) => total + getGameReturnedAmount(game), 0)
    + (includeRoulette
      ? getGameReturnedAmount({
        gameType: 'roulette',
        startingBalance: values.gameStartingBalance || values.depositAmount,
        finalBalance: values.rouletteFinalBalance,
        playedGames,
      })
      : 0)
  const totalReturned = slotsReturned + rouletteReturned
  const slotsReturnPercent = totalReturned > 0 ? (slotsReturned / totalReturned) * 100 : 0

  function closeTracker() {
    if (isEditingCompletedGame) onCancelCompletedGameEdit()
    setTrackerOpen(false)
  }

  useEffect(() => {
    const selectionChanged = previousSelection.current.gameType !== values.gameType
      || previousSelection.current.gameName !== values.gameName

    previousSelection.current = { gameType: values.gameType, gameName: values.gameName }

    if (selectionChanged) {
      setTrackerOpen(Boolean(values.gameType && values.gameName))
    }
  }, [values.gameName, values.gameType])

  useEffect(() => {
    if (!trackerOpen) return undefined

    closeTrackerButtonRef.current?.focus()
  }, [trackerOpen])

  useEffect(() => {
    if (!trackerOpen) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeTracker()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [trackerOpen, isEditingCompletedGame, onCancelCompletedGameEdit])

  return (
    <section aria-labelledby="game-heading">
      <PanelHeading>
        <PanelKicker>STEP 03 <span>—</span> GAME PLAN &amp; RISK LIMITS</PanelKicker>
        <PanelTitle id="game-heading">Set a clear game plan.</PanelTitle>
        <PanelDescription>Confirm your position, game limits, and when you’ll stop.</PanelDescription>
      </PanelHeading>
      <FieldGrid>
        <AutomaticLimits aria-label="Automatically calculated session limits">
          <RiskLimitTitle>Calculated session limits</RiskLimitTitle>
          <AutomaticLimitRow><span>Stop loss · 50% of deposit</span><strong>₹{stopLossAmount}</strong></AutomaticLimitRow>
          <AutomaticLimitRow><span>Stop profit</span><strong>₹{SESSION_RULES.stopWin.toLocaleString('en-IN')}</strong></AutomaticLimitRow>
        </AutomaticLimits>

        <ProfitProgress aria-label="Progress toward the stop-profit limit">
          <ProfitProgressCard role="group" aria-label={`Profit reached ${formatBalance(profitReached)} of ${formatBalance(profitTarget)}`}>
            <ProfitProgressRing $progress={profitProgress} aria-hidden="true">
              <div><strong>{formatBalance(profitReached)}</strong><small>reached</small></div>
            </ProfitProgressRing>
            <div>
              <strong>Profit reached</strong>
              <span>{formatBalance(profitReached)} of {formatBalance(profitTarget)} stop profit</span>
            </div>
          </ProfitProgressCard>
          <ProfitProgressCard role="group" aria-label={`Total amount placed ${formatBalance(totalInvested)}; slots ${formatBalance(slotsInvested)}, roulette ${formatBalance(rouletteInvested)}`}>
            <BreakdownRing
              $hasAmount={totalInvested > 0}
              $slotsPercent={slotsInvestmentPercent}
              aria-hidden="true"
            >
              <div><strong>{formatCompactBalance(totalInvested)}</strong><small>placed</small></div>
            </BreakdownRing>
            <div>
              <strong>Amount invested</strong>
              <span>Total stakes placed: {formatBalance(totalInvested)}</span>
              <span>Slots {formatBalance(slotsInvested)} · Roulette {formatBalance(rouletteInvested)}</span>
            </div>
          </ProfitProgressCard>
          <ProfitProgressCard role="group" aria-label={`Stop loss reached ${formatBalance(lossReached)} of ${formatBalance(stopLossTarget)}`}>
            <ProfitProgressRing $progress={lossProgress} aria-hidden="true">
              <div><strong>{formatBalance(lossReached)}</strong><small>loss</small></div>
            </ProfitProgressRing>
            <div>
              <strong>Stop-loss progress</strong>
              <span>Loss so far: {formatBalance(lossReached)}</span>
              <span>Limit: {formatBalance(stopLossTarget)}</span>
            </div>
          </ProfitProgressCard>
          <ProfitProgressCard role="group" aria-label={`Total amount returned ${formatBalance(totalReturned)}; slots ${formatBalance(slotsReturned)}, roulette ${formatBalance(rouletteReturned)}`}>
            <BreakdownRing
              $hasAmount={totalReturned > 0}
              $slotsPercent={slotsReturnPercent}
              aria-hidden="true"
            >
              <div><strong>{formatCompactBalance(totalReturned)}</strong><small>returned</small></div>
            </BreakdownRing>
            <div>
              <strong>Amount returned</strong>
              <span>Total returned: {formatBalance(totalReturned)}</span>
              <span>Slots {formatBalance(slotsReturned)} · Roulette {formatBalance(rouletteReturned)}</span>
            </div>
          </ProfitProgressCard>
        </ProfitProgress>

        {sessionStopReason && (
          <TrackerNotice $warning role="alert">
            {sessionStopReason === 'loss'
              ? 'The stop-loss limit was reached at the end of a game.'
              : sessionStopReason === 'profit'
                ? 'The stop-profit limit was reached at the end of a game.'
                : 'Total returned has reached your initial deposit.'}
            {' '}Please stop playing and do not start another game.
          </TrackerNotice>
        )}

        <Field $wide>
          <FieldLabel htmlFor="game-type">{completedGames.length > 0 && !values.gameType ? 'Select the next game mode' : 'Games planned for this session'} <RequiredTag>REQUIRED</RequiredTag></FieldLabel>
          <SelectInput id="game-type" name="gameType" value={values.gameType} onChange={onChange} required aria-invalid={Boolean(errors.gameType)} disabled={gameModeSelectionDisabled}>
            <option value="">Select planned games</option>
            <option value="slots" disabled={slotsUnavailable || gameModeSelectionDisabled}>
              Slots{slotsUnavailable || gameModeSelectionDisabled ? ' (disabled)' : ''}
            </option>
            <option value="roulette" disabled={gameModeSelectionDisabled}>
              Roulette{gameModeSelectionDisabled ? ' (disabled)' : ''}
            </option>
          </SelectInput>
          {errors.gameType && <ErrorMessage>{errors.gameType}</ErrorMessage>}
          {!values.gameType && (
            <Hint>
              {completedGames.length === 0
                ? 'Start with Roulette; slots can be selected after a roulette game is recorded.'
                : completedSlotCount >= MAX_SLOT_GAMES_PER_SESSION
                  ? `The ${MAX_SLOT_GAMES_PER_SESSION}-slot session limit is reached.`
                  : slotsMustWaitForRoulette
                    ? 'Record a roulette game before selecting another slot game.'
                    : 'Select the next game mode and game name, or continue to review your saved records.'}
            </Hint>
          )}
        </Field>

        {(includeSlots || includeRoulette) && (
          <Field $wide>
            <FieldLabel htmlFor="game-name">{includeSlots ? 'Slot game name' : 'Roulette game name'} <RequiredTag>REQUIRED</RequiredTag></FieldLabel>
            <SelectInput
              id="game-name"
              name="gameName"
              value={values.gameName}
              onChange={onChange}
              aria-invalid={Boolean(errors.gameName)}
              disabled={hasRecordedActivity || values.slotGameStopped}
              required
            >
              <option value="">{includeSlots ? 'Select a slot game' : 'Select a Roulette game'}</option>
              {(includeSlots ? SLOT_GAME_NAMES : ROULETTE_GAME_NAMES).map((gameName) => {
                const alreadyPlayed = includeSlots
                  ? playedSlotNames.has(gameName)
                  : playedRouletteNames.has(gameName)

                return (
                  <option key={gameName} value={gameName} disabled={alreadyPlayed}>
                    {alreadyPlayed ? `${gameName} (already played)` : gameName}
                  </option>
                )
              })}
            </SelectInput>
            {errors.gameName && <ErrorMessage>{errors.gameName}</ErrorMessage>}
          </Field>
        )}

        {(includeSlots || includeRoulette) && values.gameName && (
          <Field $wide>
            <AddPlayedGameButton type="button" onClick={() => setTrackerOpen(true)}>
              {includeSlots ? 'Open slot play tracker' : 'Open played games'}
            </AddPlayedGameButton>
            {!trackerOpen && errors.slotGameStopped && <ErrorMessage role="alert">{errors.slotGameStopped}</ErrorMessage>}
            {!trackerOpen && errors.slotStageResults && <ErrorMessage role="alert">{errors.slotStageResults}</ErrorMessage>}
            {!trackerOpen && errors.playedGames && <ErrorMessage role="alert">{errors.playedGames}</ErrorMessage>}
            {!trackerOpen && errors.rouletteFinalBalance && <ErrorMessage role="alert">{errors.rouletteFinalBalance}</ErrorMessage>}
          </Field>
        )}
        {completedGames.length > 0 && (
          <SavedGameDetails aria-label="Played details">
            <RiskLimitTitle>Played details</RiskLimitTitle>
            {completedGames.map((completedGame, gameIndex) => {
              const stageResults = completedGame.slotStageResults || []
              const isSlotRecord = completedGame.gameType === 'slots'
              const stopStatus = getSessionStopStatus(completedGame.finalBalance, values.depositAmount)
              const depositReturned = Number(values.depositAmount) > 0
                && getTotalReturnedAmount(completedGames.slice(0, gameIndex + 1)) >= Number(values.depositAmount)
              const balances = isSlotRecord
                ? getSlotStageBalances(stageResults, completedGame.startingBalance ?? values.depositAmount, completedGame.gameName)
                : []

              return (
                <SavedGameRecord
                  key={`${completedGame.gameName}-${gameIndex}`}
                  open={gameIndex === completedGames.length - 1}
                >
                  <summary>
                    <strong>{completedGame.gameName} · {isSlotRecord ? 'Slots' : 'Roulette'} · Starting balance {formatBalance(Number(completedGame.startingBalance))}</strong>
                  </summary>
                  {isSlotRecord ? stageResults.map((stageResult, index) => {
                    if (stageResult.status === 'pending') return null
                    const outcome = stageResult.status === 'won'
                      ? `Won · instance ${stageResult.winInstance} · Gross payout ${formatBalance(Number(stageResult.wonAmount))}`
                      : 'Loss'

                    return (
                      <SavedSlotDetailRow key={index}>
                        <strong>Stage {index + 1} · Stake ₹{(SLOT_STAKE_AMOUNTS_BY_GAME[completedGame.gameName] || [10, 25, 40, 50])[index]} · Entry amount {formatBalance(balances[index].entryAmount)}</strong>
                        <span>{outcome} · Final balance {formatBalance(balances[index].finalBalance)}</span>
                      </SavedSlotDetailRow>
                    )
                  }) : (
                    <>
                      {(completedGame.playedGames || []).map((play) => (
                        <SavedSlotDetailRow key={play.instance}>
                          <strong>Play {play.instance} · Entry ₹{play.amount}</strong>
                          <span>{play.status} · {play.placed}</span>
                        </SavedSlotDetailRow>
                      ))}
                      <SavedSlotDetailRow>
                        <strong>Base amount ₹{completedGame.rouletteBase}</strong>
                        <span>Final balance {formatBalance(Number(completedGame.finalBalance))}</span>
                      </SavedSlotDetailRow>
                    </>
                  )}
                  <SavedSlotDetailRow>
                    <strong>Stop-limit check</strong>
                    <span>
                      {!stopStatus
                        ? 'Not evaluated; final balance is unavailable.'
                        : stopStatus.stopLossReached
                          ? 'Stop loss reached.'
                          : stopStatus.stopProfitReached
                            ? 'Stop profit reached.'
                            : depositReturned
                              ? 'Total returned reached the initial deposit.'
                            : 'Stop loss and stop profit not reached.'}
                    </span>
                  </SavedSlotDetailRow>
                  <SavedGameActions>
                    <UpdateSavedGameButton
                      type="button"
                      aria-label={`Update ${completedGame.gameName} game record`}
                      title={`Update ${completedGame.gameName} game record`}
                      onClick={() => {
                        onEditCompletedGame(gameIndex)
                        setTrackerOpen(true)
                      }}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m14 5 5 5" />
                        <path d="M4 20 5.2 15 16.8 3.4a2.1 2.1 0 0 1 3 3L8.2 18.8 4 20Z" />
                      </svg>
                    </UpdateSavedGameButton>
                    <RemoveSavedGameButton
                      type="button"
                      aria-label={`Remove ${completedGame.gameName} game record`}
                      title={`Remove ${completedGame.gameName} game record`}
                      onClick={() => onRemoveCompletedGame(gameIndex)}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 7h16" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="m6 7 1 13h10l1-13M9 7V4h6v3" />
                      </svg>
                    </RemoveSavedGameButton>
                  </SavedGameActions>
                </SavedGameRecord>
              )
            })}
          </SavedGameDetails>
        )}
      </FieldGrid>
      {trackerOpen && (includeSlots || includeRoulette) && values.gameName && createPortal(
        <ModalOverlay onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeTracker()
        }}>
          <PlayedGamesDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="played-games-title"
          >
            <h2 id="played-games-title">{includeSlots ? 'Slot play tracker' : 'Played games'}</h2>
            <p>{values.gameName}</p>
            {includeSlots && (
              <PlayedGames aria-label="Played game transactions">
                <PlayedGamesHeading>
                  <RiskLimitTitle>Slot play tracker</RiskLimitTitle>
                  <Hint>Each stage is 10 plays at a fixed stake.</Hint>
                </PlayedGamesHeading>
                <TrackerNotice>
                  The first game starts with the session deposit; each later game starts with the previous game’s final balance. Entry amount is stake × plays reached. On a win, final balance is starting balance − entry amount + gross payout. On a loss, enter the final balance. A win before the 10th play stops this game.
                </TrackerNotice>
                {errors.slotGameStopped && <ErrorMessage role="alert">{errors.slotGameStopped}</ErrorMessage>}
                {errors.slotStageResults && <ErrorMessage role="alert">{errors.slotStageResults}</ErrorMessage>}
                {slotStages.map((stage, index) => {
                  const stageResult = slotStageResults[index] || {
                    status: 'pending',
                    winInstance: '',
                    wonAmount: '',
                    finalBalance: '',
                  }
                  const stoppedStageIndex = slotStageResults.findIndex((result) => (
                    result.status === 'won' && result.winInstance && Number(result.winInstance) < stage.plays
                  ))
                  const stageDisabled = values.slotGameStopped && index > stoppedStageIndex
                  return (
                    <SlotStageRow key={index}>
                      <SlotStageDescription>
                        <strong>Stage {index + 1}</strong>
                        <span>{stage.plays} plays × ₹{stage.amounts[0]}</span>
                      </SlotStageDescription>
                      <TransactionField htmlFor={`slot-stage-status-${index}`}>
                        Outcome
                        <SelectInput
                          id={`slot-stage-status-${index}`}
                          value={stageResult.status}
                          onChange={(event) => onSlotStageChange(index, 'status', event.currentTarget.value)}
                          disabled={stageDisabled}
                        >
                          <option value="pending">Choose outcome</option>
                          <option value="won">Won</option>
                          <option value="lost">Loss</option>
                        </SelectInput>
                      </TransactionField>
                      {stageResult.status === 'won' && (
                        <>
                          <TransactionField htmlFor={`slot-stage-instance-${index}`}>
                            Winning instance
                            <SelectInput
                              id={`slot-stage-instance-${index}`}
                              value={stageResult.winInstance}
                              onChange={(event) => onSlotStageChange(index, 'winInstance', event.currentTarget.value)}
                              disabled={stageDisabled}
                            >
                              <option value="">Select instance</option>
                              {Array.from({ length: stage.plays }, (_, instance) => (
                                <option key={instance + 1} value={instance + 1}>{instance + 1}</option>
                              ))}
                            </SelectInput>
                          </TransactionField>
                          <TransactionField htmlFor={`slot-stage-won-amount-${index}`}>
                            Won amount
                            <TextInput
                              id={`slot-stage-won-amount-${index}`}
                              type="number"
                              min="0"
                              step="any"
                              inputMode="decimal"
                              value={stageResult.wonAmount}
                              onChange={(event) => onSlotStageChange(index, 'wonAmount', event.currentTarget.value)}
                              placeholder="0.00"
                              disabled={stageDisabled}
                            />
                          </TransactionField>
                        </>
                      )}
                      {stageResult.status === 'lost' && (
                        <TransactionField htmlFor={`slot-stage-final-balance-${index}`}>
                          Final balance
                          <TextInput
                            id={`slot-stage-final-balance-${index}`}
                            type="number"
                            min="0"
                            step="any"
                            inputMode="decimal"
                            value={stageResult.finalBalance}
                            onChange={(event) => onSlotStageChange(index, 'finalBalance', event.currentTarget.value)}
                            placeholder="0.00"
                            disabled={stageDisabled}
                          />
                        </TransactionField>
                      )}
                      <StageBalanceSummary>
                        <span>Starting balance: {formatBalance(slotStageBalances[index].startingBalance)}</span>
                        <span>{stageResult.status === 'pending' ? 'Planned entry amount' : 'Entry amount'}: {formatBalance(slotStageBalances[index].entryAmount)}</span>
                        <span>Final balance: {formatBalance(slotStageBalances[index].finalBalance)}</span>
                      </StageBalanceSummary>
                    </SlotStageRow>
                  )
                })}
                {values.slotGameStopped && (
                  <TrackerNotice $warning role="alert">This game stopped on an early win. Add the record to save these results and choose another game.</TrackerNotice>
                )}
              </PlayedGames>
            )}
            {includeRoulette && (
              <PlayedGames aria-label="Played game transactions">
                <TransactionField htmlFor="roulette-base">
                  Roulette base amount (max ₹200)
                  <InputGroup>
                    <CurrencyPrefix>₹</CurrencyPrefix>
                    <TextInput
                      id="roulette-base"
                      name="rouletteBase"
                      type="number"
                      min="0.01"
                      max="200"
                      step="0.01"
                      inputMode="decimal"
                      value={values.rouletteBase}
                      onChange={onChange}
                      placeholder="0.00"
                      aria-invalid={Boolean(errors.rouletteBase)}
                      required
                    />
                  </InputGroup>
                </TransactionField>
                {errors.rouletteBase && <ErrorMessage role="alert">{errors.rouletteBase}</ErrorMessage>}
                {!errors.rouletteBase && <Hint>Keep the roulette base amount at or below ₹200.</Hint>}
                <PlayedGamesHeading>
                  <RiskLimitTitle>Played games</RiskLimitTitle>
                  <Hint>Starting balance: {formatBalance(Number(values.gameStartingBalance || values.depositAmount))}</Hint>
                </PlayedGamesHeading>
                {errors.playedGames && <ErrorMessage role="alert">{errors.playedGames}</ErrorMessage>}
                {playedGames.map((game, index) => (
                  <PlayedGameRow key={index}>
                    <TransactionField htmlFor={`played-game-instance-${index}`}>
                      Instance
                      <TextInput id={`played-game-instance-${index}`} value={game.instance} disabled />
                    </TransactionField>
                    <TransactionField htmlFor={`played-game-amount-${index}`}>
                      Amount
                      <TextInput
                        id={`played-game-amount-${index}`}
                        type="number"
                        min="0"
                        step="any"
                        inputMode="decimal"
                        value={game.amount}
                        onChange={(event) => onPlayedGameChange(index, 'amount', event.currentTarget.value)}
                        placeholder="0.00"
                      />
                    </TransactionField>
                    <TransactionField htmlFor={`played-game-placed-${index}`}>
                      Placed
                      <TextInput
                        id={`played-game-placed-${index}`}
                        value={game.placed}
                        onChange={(event) => onPlayedGameChange(index, 'placed', event.currentTarget.value)}
                        placeholder="e.g. Red / Blue"
                      />
                    </TransactionField>
                    <TransactionField htmlFor={`played-game-status-${index}`}>
                      Status
                      <SelectInput
                        id={`played-game-status-${index}`}
                        value={game.status}
                        onChange={(event) => onPlayedGameChange(index, 'status', event.currentTarget.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                      </SelectInput>
                    </TransactionField>
                    <TransactionButton
                      type="button"
                      onClick={() => onRemovePlayedGame(index)}
                      aria-label={`Remove played game ${index + 1}`}
                      disabled={index !== playedGames.length - 1}
                    >
                      Remove
                    </TransactionButton>
                  </PlayedGameRow>
                ))}
                {playedGames.length < 40 && (
                  <AddPlayedGameButton type="button" onClick={onAddPlayedGame} disabled={!canAddPlayedGame}>
                    Add played game
                  </AddPlayedGameButton>
                )}
                <TransactionField htmlFor="roulette-final-balance">
                  Final balance
                  <TextInput
                    id="roulette-final-balance"
                    name="rouletteFinalBalance"
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    value={values.rouletteFinalBalance}
                    onChange={onChange}
                    placeholder="0.00"
                    aria-invalid={Boolean(errors.rouletteFinalBalance)}
                  />
                </TransactionField>
                {errors.rouletteFinalBalance && <ErrorMessage role="alert">{errors.rouletteFinalBalance}</ErrorMessage>}
              </PlayedGames>
            )}
            <ModalActions>
              {includeSlots && (
                <ModalButton
                  $primary
                  type="button"
                  onClick={() => {
                    if (onAddSlotRecord()) setTrackerOpen(false)
                  }}
                >
                  {isEditingCompletedGame ? 'Update record' : 'Add record'}
                </ModalButton>
              )}
              {includeRoulette && (
                <ModalButton
                  $primary
                  type="button"
                  onClick={() => {
                    if (onAddRouletteRecord()) setTrackerOpen(false)
                  }}
                >
                  {isEditingCompletedGame ? 'Update record' : 'Add record'}
                </ModalButton>
              )}
              <ModalButton ref={closeTrackerButtonRef} type="button" onClick={closeTracker}>
                {isEditingCompletedGame ? 'Cancel edit' : 'Close'}
              </ModalButton>
            </ModalActions>
          </PlayedGamesDialog>
        </ModalOverlay>,
        document.body,
      )}
      <InlineNote><NoteIcon aria-hidden="true">i</NoteIcon>Use the slot play tracker to record each 10-play stake stage. Roulette base amount: maximum ₹200.</InlineNote>
    </section>
  )
}

import styled from 'styled-components'
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
  ROULETTE_GAME_NAMES,
  SESSION_RULES,
  SLOT_GAME_NAMES,
  SLOT_PLAY_STAGES,
} from '../constants'

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

const PlayedGames = styled.div`
  display: grid;
  grid-column: 1 / -1;
  gap: 10px;
  margin-top: 6px;
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

const CompletedGames = styled.div`
  display: grid;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid #303d35;
`

const CompletedGame = styled.div`
  display: grid;
  gap: 5px;
  color: #aab6ad;
  font-size: 10px;

  strong {
    color: #d5ded7;
    font-size: 11px;
  }
`

export function GamePlanStep({
  values,
  errors,
  onChange,
  onPlayedGameChange,
  onAddPlayedGame,
  onRemovePlayedGame,
  onStartNewSlotGame,
}) {
  const includeSlots = values.gameType === 'slots'
  const includeRoulette = values.gameType === 'roulette'
  const playedGames = values.playedGames || []
  const currentStageIndex = Math.min(Math.floor(playedGames.length / 10), SLOT_PLAY_STAGES.length - 1)
  const currentStage = SLOT_PLAY_STAGES[currentStageIndex]
  const currentStagePlay = (playedGames.length % 10) + 1
  const lastPlayedGame = playedGames[playedGames.length - 1]
  const canAddPlayedGame = Boolean(values.gameName?.trim())
    && !values.slotGameStopped
    && (!includeSlots || playedGames.length < SLOT_PLAY_STAGES.reduce((total, stage) => total + stage.plays, 0))
    && (!lastPlayedGame || (lastPlayedGame.status !== 'pending' && Boolean(lastPlayedGame.placed.trim())))
  const stopLoss = Number(values.depositAmount) * SESSION_RULES.stopLossPercent
  const stopLossAmount = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(stopLoss)

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

        <Field $wide>
          <FieldLabel htmlFor="game-type">Games planned for this session <RequiredTag>REQUIRED</RequiredTag></FieldLabel>
          <SelectInput id="game-type" name="gameType" value={values.gameType} onChange={onChange} required aria-invalid={Boolean(errors.gameType)} disabled={playedGames.length > 0 || (values.completedGames || []).length > 0}>
            <option value="">Select planned games</option>
            <option value="slots">Slots</option>
            <option value="roulette">Roulette</option>
          </SelectInput>
          {errors.gameType && <ErrorMessage>{errors.gameType}</ErrorMessage>}
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
              disabled={playedGames.length > 0 || values.slotGameStopped}
              required
            >
              <option value="">{includeSlots ? 'Select a slot game' : 'Select a Roulette game'}</option>
              {(includeSlots ? SLOT_GAME_NAMES : ROULETTE_GAME_NAMES).map((gameName) => (
                <option key={gameName} value={gameName}>{gameName}</option>
              ))}
            </SelectInput>
            {errors.gameName && <ErrorMessage>{errors.gameName}</ErrorMessage>}
          </Field>
        )}

        {includeRoulette && (
          <Field $wide>
            <FieldLabel htmlFor="roulette-base">Roulette base amount <RequiredTag>MAX ₹200</RequiredTag></FieldLabel>
            <InputGroup>
              <CurrencyPrefix>₹</CurrencyPrefix>
              <TextInput id="roulette-base" name="rouletteBase" type="number" min="0.01" max="200" step="0.01" placeholder="0.00" inputMode="decimal" value={values.rouletteBase} onChange={onChange} aria-invalid={Boolean(errors.rouletteBase)} required />
            </InputGroup>
            {errors.rouletteBase ? <ErrorMessage>{errors.rouletteBase}</ErrorMessage> : <Hint>Keep the roulette base amount at or below ₹200.</Hint>}
          </Field>
        )}

        {(includeSlots || includeRoulette) && (
          <PlayedGames aria-label="Played game transactions">
            <PlayedGamesHeading>
              <RiskLimitTitle>{includeSlots ? 'Slot play tracker' : 'Played games'}</RiskLimitTitle>
              <Hint>
                {includeSlots
                  ? playedGames.length < 40
                    ? `Stage ${currentStageIndex + 1} of 4 · instance ${currentStagePlay} of 10 · ₹${currentStage.amounts.join(' / ₹')}`
                    : 'All 40 plays are recorded.'
                  : 'Track each game instance and its transaction.'}
              </Hint>
            </PlayedGamesHeading>
            {includeSlots && (
              <TrackerNotice>
                Record 10 plays at each stake stage: ₹10 or ₹12.50, then ₹20 or ₹25, then ₹40, then ₹50. A win before completing a 10-play stage stops this game; start a new game to restart the sequence.
              </TrackerNotice>
            )}
            {errors.slotGameStopped && <ErrorMessage role="alert">{errors.slotGameStopped}</ErrorMessage>}
            {errors.playedGames && <ErrorMessage role="alert">{errors.playedGames}</ErrorMessage>}
            {playedGames.map((game, index) => {
              const stage = includeSlots ? SLOT_PLAY_STAGES[Math.floor(index / 10)] : null
              return (
            <PlayedGameRow key={index}>
              <TransactionField htmlFor={`played-game-instance-${index}`}>
                Instance
                <TextInput
                  id={`played-game-instance-${index}`}
                  value={game.instance}
                  disabled
                />
              </TransactionField>
              <TransactionField htmlFor={`played-game-amount-${index}`}>
                Amount
                {stage ? (
                  <SelectInput
                    id={`played-game-amount-${index}`}
                    value={game.amount}
                    onChange={(event) => onPlayedGameChange(index, 'amount', event.currentTarget.value)}
                    disabled={values.slotGameStopped}
                  >
                    {stage.amounts.map((amount) => <option key={amount} value={amount}>{`₹${amount}`}</option>)}
                  </SelectInput>
                ) : (
                  <TextInput
                    id={`played-game-amount-${index}`}
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    value={game.amount}
                    onChange={(event) => onPlayedGameChange(index, 'amount', event.currentTarget.value)}
                    placeholder="0.00"
                    disabled={values.slotGameStopped}
                  />
                )}
              </TransactionField>
              <TransactionField htmlFor={`played-game-placed-${index}`}>
                Placed
                <TextInput
                  id={`played-game-placed-${index}`}
                  value={game.placed}
                  onChange={(event) => onPlayedGameChange(index, 'placed', event.currentTarget.value)}
                  placeholder="e.g. Red / Blue"
                  disabled={values.slotGameStopped}
                />
              </TransactionField>
              <TransactionField htmlFor={`played-game-status-${index}`}>
                Status
                <SelectInput
                  id={`played-game-status-${index}`}
                  value={game.status}
                  onChange={(event) => onPlayedGameChange(index, 'status', event.currentTarget.value)}
                  disabled={values.slotGameStopped}
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
                disabled={index !== playedGames.length - 1 || values.slotGameStopped}
              >
                Remove
              </TransactionButton>
            </PlayedGameRow>
              )
            })}
            {values.slotGameStopped && (
              <>
                <TrackerNotice $warning role="alert">A win was recorded before this stage reached 10 plays. Stop this game and start a new game to continue.</TrackerNotice>
                <AddPlayedGameButton type="button" onClick={onStartNewSlotGame}>Start a new game</AddPlayedGameButton>
              </>
            )}
            {includeSlots && !values.slotGameStopped && playedGames.length === 40 && (
              <TrackerNotice>All 40 plays are recorded. The slot sequence is complete.</TrackerNotice>
            )}
            {(!includeSlots || (!values.slotGameStopped && playedGames.length < 40)) && (
              <AddPlayedGameButton type="button" onClick={onAddPlayedGame} disabled={!canAddPlayedGame}>
                {includeSlots ? 'Add next slot instance' : 'Add played game'}
              </AddPlayedGameButton>
            )}
            {(values.completedGames || []).length > 0 && (
              <CompletedGames aria-label="Completed game history">
                {(values.completedGames || []).map((completedGame, gameIndex) => (
                  <CompletedGame key={`${completedGame.gameName}-${gameIndex}`}>
                    <strong>{completedGame.gameName}</strong>
                    {completedGame.playedGames.map((game) => (
                      <span key={game.instance}>
                        Instance {game.instance} · ₹{game.amount} · {game.placed} · {game.status}
                      </span>
                    ))}
                  </CompletedGame>
                ))}
              </CompletedGames>
            )}
          </PlayedGames>
        )}
      </FieldGrid>
      <InlineNote><NoteIcon aria-hidden="true">i</NoteIcon>Slot sequence is tracked above. Roulette base amount: maximum ₹200.</InlineNote>
    </section>
  )
}

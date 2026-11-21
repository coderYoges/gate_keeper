import styled from 'styled-components'
import {
  Checkbox,
  ChoiceCard,
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

const ConditionalGrid = styled(FieldGrid)`
  grid-column: 1 / -1;

  @media (max-width: 600px) {
    grid-column: auto;
  }
`

export function GamePlanStep({ values, errors, onChange }) {
  const includeSlots = values.gameType === 'slots' || values.gameType === 'both'
  const includeRoulette = values.gameType === 'roulette' || values.gameType === 'both'

  return (
    <section aria-labelledby="game-heading">
      <PanelHeading>
        <PanelKicker>STEP 03 <span>—</span> GAME-SPECIFIC RULES</PanelKicker>
        <PanelTitle id="game-heading">Set a clear game plan.</PanelTitle>
        <PanelDescription>Confirm your position and keep each game within its limits.</PanelDescription>
      </PanelHeading>
      <FieldGrid>
        <Field $wide>
          <FieldLabel htmlFor="game-type">Games planned for this session <RequiredTag>REQUIRED</RequiredTag></FieldLabel>
          <SelectInput id="game-type" name="gameType" value={values.gameType} onChange={onChange} required aria-invalid={Boolean(errors.gameType)}>
            <option value="">Select planned games</option>
            <option value="slots">Slots</option>
            <option value="roulette">Roulette</option>
            <option value="both">Slots and roulette</option>
          </SelectInput>
          {errors.gameType && <ErrorMessage>{errors.gameType}</ErrorMessage>}
        </Field>

        {includeSlots && (
          <ConditionalGrid>
            <Field>
              <FieldLabel htmlFor="slot-bet">Slot amount per game <RequiredTag>MAX ₹50</RequiredTag></FieldLabel>
              <InputGroup>
                <CurrencyPrefix>₹</CurrencyPrefix>
                <TextInput id="slot-bet" name="slotBet" type="number" min="0.01" max="50" step="0.01" placeholder="0.00" inputMode="decimal" value={values.slotBet} onChange={onChange} aria-invalid={Boolean(errors.slotBet)} required />
              </InputGroup>
              {errors.slotBet && <ErrorMessage>{errors.slotBet}</ErrorMessage>}
            </Field>
            <Field>
              <FieldLabel htmlFor="slot-games">Number of slot games <RequiredTag>MAX 3</RequiredTag></FieldLabel>
              <TextInput id="slot-games" name="slotGames" type="number" min="1" max="3" step="1" placeholder="1" inputMode="numeric" value={values.slotGames} onChange={onChange} aria-invalid={Boolean(errors.slotGames)} required />
              {errors.slotGames && <ErrorMessage>{errors.slotGames}</ErrorMessage>}
            </Field>
          </ConditionalGrid>
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

        <ChoiceCard>
          <Checkbox id="position-confirm" name="positionConfirm" checked={values.positionConfirm} onChange={onChange} aria-invalid={Boolean(errors.positionConfirm)} />
          <span>
            <strong>Player position check</strong>
            <small>I’ll play only in my corresponding assigned position.</small>
            {errors.positionConfirm && <ErrorMessage>{errors.positionConfirm}</ErrorMessage>}
          </span>
        </ChoiceCard>
      </FieldGrid>
      <InlineNote><NoteIcon aria-hidden="true">i</NoteIcon>Slot amount: maximum ₹50. Maximum 3 slot games per session. Roulette base amount: maximum ₹200.</InlineNote>
    </section>
  )
}

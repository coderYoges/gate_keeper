import {
  ErrorMessage,
  Field,
  FieldGrid,
  FieldLabel,
  Hint,
  InlineNote,
  NoteIcon,
  PanelDescription,
  PanelHeading,
  PanelKicker,
  PanelTitle,
  RequiredTag,
  SelectInput,
} from './FormPrimitives'

export function ReadinessStep({ playerIds, values, errors, onChange }) {
  return (
    <section aria-labelledby="readiness-heading">
      <PanelHeading>
        <PanelKicker>STEP 01 <span>—</span> PRE-SESSION CHECK</PanelKicker>
        <PanelTitle id="readiness-heading">How are you feeling?</PanelTitle>
        <PanelDescription>Only start a session when you feel rested, calm, and focused.</PanelDescription>
      </PanelHeading>
      <FieldGrid>
        <Field $wide>
          <FieldLabel htmlFor="player-id">Player ID <RequiredTag>REQUIRED</RequiredTag></FieldLabel>
          <SelectInput id="player-id" name="playerId" value={values.playerId} onChange={onChange} required aria-invalid={Boolean(errors.playerId)}>
            <option value="">Select a player ID</option>
            {playerIds.map((playerId) => <option key={playerId} value={playerId}>{playerId}</option>)}
          </SelectInput>
          {errors.playerId ? <ErrorMessage>{errors.playerId}</ErrorMessage> : <Hint>Demo IDs are listed in the PLAYER_IDS constant.</Hint>}
        </Field>
        <Field $wide>
          <FieldLabel htmlFor="mental-state">Mental and emotional check <RequiredTag>REQUIRED</RequiredTag></FieldLabel>
          <SelectInput id="mental-state" name="mentalState" value={values.mentalState} onChange={onChange} required aria-invalid={Boolean(errors.mentalState)}>
            <option value="">Choose the statement that fits</option>
            <option value="ready">I feel rested, calm, and focused</option>
            <option value="not-ready">I feel tired, stressed, angry, or distracted</option>
          </SelectInput>
          {errors.mentalState ? <ErrorMessage role="alert">{errors.mentalState}</ErrorMessage> : <Hint>If you’re not feeling ready, take a break and come back later.</Hint>}
        </Field>
      </FieldGrid>
      <InlineNote><NoteIcon aria-hidden="true">i</NoteIcon>A pause is always a valid choice. You can leave this check at any time.</InlineNote>
    </section>
  )
}

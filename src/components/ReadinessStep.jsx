import {
  Checkbox,
  ChoiceCard,
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
  const selectedPlayer = playerIds.find((player) => player.playerId === values.playerId)

  return (
    <section aria-labelledby="readiness-heading">
      <PanelHeading>
        <PanelKicker>STEP 01 <span>—</span> PRE-SESSION CHECK</PanelKicker>
        <PanelTitle id="readiness-heading">How are you feeling?</PanelTitle>
        <PanelDescription>Only start a session when you feel rested, calm, and focused.</PanelDescription>
      </PanelHeading>
      <FieldGrid>
        <Field $wide>
          <FieldLabel htmlFor="player-id">Who is Playing? <RequiredTag>REQUIRED</RequiredTag></FieldLabel>
          <SelectInput id="player-id" name="playerId" value={values.playerId} onChange={onChange} required aria-invalid={Boolean(errors.playerId)}>
            <option value="">Select a player</option>
            {playerIds.map((player) => (
              <option key={player.playerId} value={player.playerId}>
                {player.playerName}
              </option>
            ))}
          </SelectInput>
          {errors.playerId ? <ErrorMessage>{errors.playerId}</ErrorMessage> : <Hint>Select your profile by name, player ID, location, and device.</Hint>}
        </Field>
        {selectedPlayer && (
          <Field $wide>
            <ChoiceCard>
              <Checkbox
                name="playerDetailsConfirmed"
                checked={values.playerDetailsConfirmed}
                onChange={onChange}
                aria-invalid={Boolean(errors.playerDetailsConfirmed)}
              />
              <span>
                <strong>Are you playing in accordance with your profile?</strong>
                <small>Device: {selectedPlayer.deviceName}</small>
                <small>Location: {selectedPlayer.location}</small>
              </span>
            </ChoiceCard>
            {errors.playerDetailsConfirmed && <ErrorMessage role="alert">{errors.playerDetailsConfirmed}</ErrorMessage>}
          </Field>
        )}
        <Field $wide>
          <ChoiceCard>
            <Checkbox
              name="mobileDataConfirmed"
              checked={values.mobileDataConfirmed}
              onChange={onChange}
              aria-invalid={Boolean(errors.mobileDataConfirmed)}
            />
            <span>
              <strong>Are you using mobile data only?</strong>
              <small>Do not use a hotspot or Wi-Fi connection.</small>
            </span>
          </ChoiceCard>
          {errors.mobileDataConfirmed && <ErrorMessage role="alert">{errors.mobileDataConfirmed}</ErrorMessage>}
        </Field>
        <Field $wide>
          <ChoiceCard>
            <Checkbox
              name="differentSimConfirmed"
              checked={values.differentSimConfirmed}
              onChange={onChange}
              aria-invalid={Boolean(errors.differentSimConfirmed)}
            />
            <span>
              <strong>Are you using a different SIM card from the previous user?</strong>
              <small>Do not use the SIM card used by the previous user.</small>
            </span>
          </ChoiceCard>
          {errors.differentSimConfirmed && <ErrorMessage role="alert">{errors.differentSimConfirmed}</ErrorMessage>}
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

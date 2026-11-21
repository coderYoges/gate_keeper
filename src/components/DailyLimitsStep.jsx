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
  TextInput,
} from './FormPrimitives'

const LastPlayedStatus = styled.div`
  padding: 9px 12px;
  border: 1px solid ${({ $tone }) => ($tone === 'error' ? '#70433e' : $tone === 'cooling' ? '#685436' : $tone === 'clear' ? '#47613a' : '#334138')};
  border-radius: 7px;
  background: ${({ $tone }) => ($tone === 'error' ? '#2d1d1a' : $tone === 'cooling' ? '#2b251a' : $tone === 'clear' ? '#1e281b' : '#1a2420')};
  color: ${({ $tone }) => ($tone === 'error' ? '#f09a8e' : $tone === 'cooling' ? '#d8bd89' : $tone === 'clear' ? '#b1d28a' : '#abb7af')};
  font-size: 12px;
  line-height: 1.55;
  overflow-wrap: anywhere;
`

export function DailyLimitsStep({ values, errors, dailyLimit, cooldownStatus, onChange }) {
  return (
    <section aria-labelledby="limits-heading">
      <PanelHeading>
        <PanelKicker>STEP 02 <span>—</span> TIME &amp; SESSION LIMITS</PanelKicker>
        <PanelTitle id="limits-heading">Keep within your limits.</PanelTitle>
        <PanelDescription>Check which session this is today, your deposit, and your cooling time.</PanelDescription>
      </PanelHeading>
      <FieldGrid>
        <Field>
          <FieldLabel htmlFor="sessions-today">Current session for the day <RequiredTag>REQUIRED</RequiredTag></FieldLabel>
          <TextInput id="sessions-today" name="sessionsToday" type="number" min="1" max={dailyLimit} step="1" placeholder="1" inputMode="numeric" value={values.sessionsToday} onChange={onChange} aria-invalid={Boolean(errors.sessionsToday)} required />
          {errors.sessionsToday ? <ErrorMessage>{errors.sessionsToday}</ErrorMessage> : <Hint>Today’s limit: {dailyLimit} sessions.</Hint>}
        </Field>
        <Field>
          <FieldLabel htmlFor="deposit-amount">Deposit for this session <RequiredTag>REQUIRED</RequiredTag></FieldLabel>
          <InputGroup>
            <CurrencyPrefix>₹</CurrencyPrefix>
            <TextInput id="deposit-amount" name="depositAmount" type="number" min="1" max="15000" step="1" placeholder="0" inputMode="numeric" value={values.depositAmount} onChange={onChange} aria-invalid={Boolean(errors.depositAmount)} required />
          </InputGroup>
          {errors.depositAmount ? <ErrorMessage>{errors.depositAmount}</ErrorMessage> : <Hint>Maximum deposit: ₹15,000 per user per session.</Hint>}
        </Field>
        <Field $wide>
          <FieldLabel>3-hour cooling period <RequiredTag>REQUIRED</RequiredTag></FieldLabel>
          <ChoiceCard>
            <Checkbox id="cooldown-confirmed" name="cooldownConfirmed" checked={values.cooldownConfirmed} onChange={onChange} aria-invalid={Boolean(errors.cooldownConfirmed)} />
            <span>
              <strong>Cooling-period check</strong>
              <small>I confirm at least 3 hours have passed since my last session.</small>
              {errors.cooldownConfirmed && <ErrorMessage role="alert">{errors.cooldownConfirmed}</ErrorMessage>}
            </span>
          </ChoiceCard>
          <LastPlayedStatus $tone={cooldownStatus.tone} aria-live="polite">{cooldownStatus.text}</LastPlayedStatus>
          <Hint>This is self-reported and is not checked against a game account.</Hint>
        </Field>
      </FieldGrid>
      <InlineNote><NoteIcon aria-hidden="true">i</NoteIcon>Weekday limit: 2 sessions. Weekend limit: 4 sessions. Wait at least 3 hours between sessions.</InlineNote>
    </section>
  )
}

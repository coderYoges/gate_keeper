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

const LastPlayedStatus = styled.div`
  padding: 11px 12px;
  border: 1px solid ${({ $tone }) => ($tone === 'error' ? '#efd8d4' : $tone === 'cooling' ? '#f0dfc8' : '#dce8d3')};
  border-radius: 7px;
  background: ${({ $tone }) => ($tone === 'error' ? '#fff5f3' : $tone === 'cooling' ? '#fff8ef' : '#f3f8ee')};
  color: ${({ $tone }) => ($tone === 'error' ? '#a34f45' : $tone === 'cooling' ? '#93662e' : '#4f7435')};
  font-size: 11px;
  line-height: 1.55;
  overflow-wrap: anywhere;
`

export function DailyLimitsStep({ values, errors, dailyLimit, cooldownStatus, onChange }) {
  return (
    <section aria-labelledby="limits-heading">
      <PanelHeading>
        <PanelKicker>STEP 02 <span>—</span> TIME &amp; SESSION LIMITS</PanelKicker>
        <PanelTitle id="limits-heading">Keep within your limits.</PanelTitle>
        <PanelDescription>Check how many sessions you’ve played today, your deposit, and your cooling time.</PanelDescription>
      </PanelHeading>
      <FieldGrid>
        <Field>
          <FieldLabel htmlFor="sessions-today">Sessions already played today <RequiredTag>REQUIRED</RequiredTag></FieldLabel>
          <TextInput id="sessions-today" name="sessionsToday" type="number" min="0" max={dailyLimit} step="1" placeholder="0" inputMode="numeric" value={values.sessionsToday} onChange={onChange} aria-invalid={Boolean(errors.sessionsToday)} required />
          {errors.sessionsToday ? <ErrorMessage>{errors.sessionsToday}</ErrorMessage> : <Hint>Today’s limit: {dailyLimit} sessions.</Hint>}
        </Field>
        <Field>
          <FieldLabel htmlFor="deposit-amount">Deposit for this session <RequiredTag>REQUIRED</RequiredTag></FieldLabel>
          <InputGroup>
            <CurrencyPrefix>₹</CurrencyPrefix>
            <TextInput id="deposit-amount" name="depositAmount" type="number" min="0.01" max="15000" step="0.01" placeholder="0.00" inputMode="decimal" value={values.depositAmount} onChange={onChange} aria-invalid={Boolean(errors.depositAmount)} required />
          </InputGroup>
          {errors.depositAmount ? <ErrorMessage>{errors.depositAmount}</ErrorMessage> : <Hint>Maximum deposit: ₹15,000 per user per session.</Hint>}
        </Field>
        <Field $wide>
          <FieldLabel>Last played / 3-hour cooling period</FieldLabel>
          <LastPlayedStatus $tone={cooldownStatus.tone} aria-live="polite">{cooldownStatus.text}</LastPlayedStatus>
          {errors.cooldown ? <ErrorMessage role="alert">{errors.cooldown}</ErrorMessage> : <Hint>This demo saves the last played time in this browser for the selected player ID.</Hint>}
        </Field>
      </FieldGrid>
      <InlineNote><NoteIcon aria-hidden="true">i</NoteIcon>Weekday limit: 2 sessions. Weekend limit: 4 sessions. Wait at least 3 hours between sessions.</InlineNote>
    </section>
  )
}

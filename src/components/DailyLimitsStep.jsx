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

const RetryButton = styled.button`
  min-height: 34px;
  padding: 0 11px;
  border: 1px solid #435346;
  border-radius: 6px;
  background: #17211b;
  color: #edf3ef;
  font-size: 11px;
  font-weight: 700;
`

const CurrentSessionInput = styled(TextInput)`
  border-color: #36443b;
  background: #1a231e;
  color: #89958d;
  cursor: not-allowed;
`

export function DailyLimitsStep({
  values,
  errors,
  dailyLimit,
  cooldownStatus,
  sessionHistoryLoading,
  sessionHistoryError,
  onRetrySessionHistory,
  onChange,
}) {
  return (
    <section aria-labelledby="limits-heading">
      <PanelHeading>
        <PanelKicker>STEP 02 <span>—</span> TIME &amp; SESSION LIMITS</PanelKicker>
        <PanelTitle id="limits-heading">Keep within your limits.</PanelTitle>
        <PanelDescription>Check which session this is today, your deposit, and your cooling time.</PanelDescription>
      </PanelHeading>
      <FieldGrid>
        <Field>
          <FieldLabel htmlFor="sessions-today">Current session for the day</FieldLabel>
          <CurrentSessionInput
            id="sessions-today"
            name="sessionsToday"
            type="number"
            value={values.sessionsToday}
            readOnly
            aria-invalid={Boolean(errors.sessionsToday)}
          />
          {errors.sessionsToday && !sessionHistoryError
            ? <ErrorMessage>{errors.sessionsToday}</ErrorMessage>
            : <Hint>
              {sessionHistoryLoading
                ? 'Checking saved session history…'
                : sessionHistoryError
                  ? 'Session count is unavailable until Firebase history can be read.'
                  : `Calculated from saved sessions. Today’s limit: ${dailyLimit}.`}
            </Hint>}
        </Field>
        <Field $wide>
          <ChoiceCard>
            <Checkbox
              id="existing-balance"
              name="existingBalance"
              checked={values.existingBalance}
              onChange={onChange}
            />
            <span>
              <strong>There is already a balance in my account</strong>
              <small>If checked, deposit at least ₹300 for this session.</small>
            </span>
          </ChoiceCard>
        </Field>
        <Field>
          <FieldLabel htmlFor="deposit-amount">Deposit for this session <RequiredTag>REQUIRED</RequiredTag></FieldLabel>
          <InputGroup>
            <CurrencyPrefix>₹</CurrencyPrefix>
            <TextInput id="deposit-amount" name="depositAmount" type="number" min={values.existingBalance ? '300' : '1'} max="15000" step="1" placeholder="0" inputMode="numeric" value={values.depositAmount} onChange={onChange} aria-invalid={Boolean(errors.depositAmount)} required />
          </InputGroup>
          {errors.depositAmount
            ? <ErrorMessage>{errors.depositAmount}</ErrorMessage>
            : <Hint>{values.existingBalance ? 'Minimum deposit: ₹300. ' : ''}Maximum deposit: ₹15,000 per user per session.</Hint>}
        </Field>
        <Field $wide>
          <FieldLabel>Cooling-period check <RequiredTag>REQUIRED</RequiredTag></FieldLabel>
          <ChoiceCard>
            <span>
              <strong>Automatic cooling-period check</strong>
              <small>Checked against this player’s latest saved Firebase session.</small>
            </span>
          </ChoiceCard>
          <LastPlayedStatus $tone={cooldownStatus.tone} aria-live="polite">{cooldownStatus.text}</LastPlayedStatus>
          {sessionHistoryError && (
            <>
              <ErrorMessage role="alert">{sessionHistoryError}</ErrorMessage>
              <RetryButton type="button" onClick={onRetrySessionHistory}>Retry session check</RetryButton>
            </>
          )}
        </Field>
      </FieldGrid>
      <InlineNote><NoteIcon aria-hidden="true">i</NoteIcon>Weekday limit: 2 sessions; weekend limit: 4. Wait 3 hours between sessions, or 1 hour on weekends after 6 pm.</InlineNote>
    </section>
  )
}

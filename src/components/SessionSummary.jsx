import styled from 'styled-components'

const SideColumn = styled.aside`
  display: grid;
  gap: 12px;
`

const SummaryCard = styled.section`
  position: relative;
  min-height: 344px;
  overflow: hidden;
  padding: 23px 22px 0;
  border-radius: 14px;
  background: #192820;
  color: #fff;

  &::after {
    position: absolute;
    top: -70px;
    right: -80px;
    width: 190px;
    height: 190px;
    border: 1px solid rgb(200 241 105 / 9%);
    border-radius: 50%;
    box-shadow: 0 0 0 22px rgb(200 241 105 / 3%), 0 0 0 46px rgb(200 241 105 / 2%);
    content: "";
    pointer-events: none;
  }

  @media (max-width: 900px) {
    min-height: 0;
  }

  @media (max-width: 600px) {
    padding: 20px 19px 0;
  }
`

const CardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const CardLabel = styled.span`
  color: #a9b5aa;
  font-size: 8px;
  font-weight: 750;
  letter-spacing: 1.05px;

  span {
    padding: 0 3px;
    color: #718273;
  }
`

const LockIcon = styled.span`
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 13%);
  border-radius: 9px;
  background: rgb(255 255 255 / 4%);

  svg {
    width: 17px;
    stroke: #c8f169;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`

const StateLabel = styled.p`
  margin: 29px 0 7px;
  color: #95a397;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 1px;
`

const StatusTitle = styled.h2`
  margin: 0 0 7px;
  color: #f3f6ef;
  font-size: 20px;
  font-weight: 550;
  letter-spacing: -0.5px;
`

const StatusCopy = styled.p`
  min-height: 33px;
  margin: 0;
  color: #a8b3a9;
  font-size: 10px;
  line-height: 1.6;
`

const Divider = styled.div`
  height: 1px;
  margin: 20px 0 18px;
  background: rgb(255 255 255 / 12%);
`

const RequirementsTitle = styled.p`
  margin: 0 0 14px;
  color: #91a091;
  font-size: 8px;
  font-weight: 750;
  letter-spacing: 0.9px;
`

const RequirementRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 11px 0;
  color: #d4ddd4;
  font-size: 10px;

  > span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  strong {
    color: #fff;
    font-size: 10px;
    font-weight: 600;
  }
`

const Dot = styled.i`
  width: 6px;
  height: 6px;
  display: inline-block;
  border-radius: 50%;
  background: ${({ $mint }) => ($mint ? '#8bc7ad' : '#c8f169')};
`

const CardFoot = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 19px -22px 0;
  padding: 12px 22px;
  border-top: 1px solid rgb(255 255 255 / 11%);
  color: #9ba99d;
  font-size: 9px;

  span {
    color: #c8f169;
    font-size: 13px;
  }

  @media (max-width: 600px) {
    margin-right: -19px;
    margin-left: -19px;
    padding-right: 19px;
    padding-left: 19px;
  }
`

const TipCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 14px 13px;
  border: 1px solid #e4e9e1;
  border-radius: 10px;
  background: #f8faf6;

  > span {
    color: #80a94d;
    font-size: 16px;
  }

  p {
    margin: 0;
    color: #818b81;
    font-size: 9px;
    line-height: 1.6;
  }

  strong {
    color: #4c594d;
    font-size: 10px;
    font-weight: 650;
  }
`

export function SessionSummary({ dailyLimit, cooldownStatus, outcome }) {
  const statusTitle = outcome?.type === 'success'
    ? 'Checks passed'
    : cooldownStatus.tone === 'clear'
      ? 'Cooling period confirmed'
      : 'Not started'

  const statusCopy = outcome?.type === 'success'
    ? 'Your pre-session checks passed using the answers you provided.'
    : outcome?.type === 'error'
      ? outcome.message
      : cooldownStatus.text

  return (
    <SideColumn aria-label="Session limits summary">
      <SummaryCard>
        <CardTop>
          <CardLabel>GATEKEEPER <span>·</span> SESSION CHECK</CardLabel>
          <LockIcon aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><path d="M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5z" /><circle cx="12" cy="15" r="1.2" /></svg>
          </LockIcon>
        </CardTop>
        <StateLabel>CHECK STATUS</StateLabel>
        <StatusTitle>{statusTitle}</StatusTitle>
        <StatusCopy>{statusCopy || 'Complete each step to review your pre-session limits.'}</StatusCopy>
        <Divider />
        <RequirementsTitle>YOUR SESSION LIMITS</RequirementsTitle>
        <RequirementRow><span><Dot />Daily sessions</span><strong>{dailyLimit} today</strong></RequirementRow>
        <RequirementRow><span><Dot $mint />Deposit cap</span><strong>₹15,000</strong></RequirementRow>
        <RequirementRow><span><Dot />Cooling period</span><strong>3 hours</strong></RequirementRow>
        <CardFoot><span aria-hidden="true">i</span> Demo only — no game account is connected.</CardFoot>
      </SummaryCard>
      <TipCard>
        <span aria-hidden="true">✳</span>
        <p><strong>Limits work best when they’re real.</strong><br />This browser demo can’t monitor live play or enforce game controls.</p>
      </TipCard>
    </SideColumn>
  )
}

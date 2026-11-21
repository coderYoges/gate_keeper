import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { PLAYER_IDS, STEP_LABELS } from './constants'
import { DailyLimitsStep } from './components/DailyLimitsStep'
import { FailureModal } from './components/FailureModal'
import { GamePlanStep } from './components/GamePlanStep'
import { ReadinessStep } from './components/ReadinessStep'
import { ReviewStep } from './components/ReviewStep'
import { SessionSummary } from './components/SessionSummary'
import { SuccessModal } from './components/SuccessModal'
import { StepProgress } from './components/StepProgress'
import { GlobalStyles } from './styles/GlobalStyles'
import {
  getCooldownStatus,
  getDailyLimit,
  getLastPlayed,
  recordLastPlayed,
  validateStep,
} from './utils/sessionChecks'

const initialValues = {
  playerId: '',
  mentalState: '',
  sessionsToday: '',
  depositAmount: '',
  gameType: '',
  slotBet: '',
  slotGames: '',
  rouletteBase: '',
  positionConfirm: false,
  stopLossCheck: false,
  stopWinCheck: false,
}

const Shell = styled.div`
  width: min(1192px, calc(100% - 64px));
  min-height: 100vh;
  margin: 0 auto;

  @media (max-width: 900px) {
    width: min(720px, calc(100% - 40px));
  }

  @media (max-width: 600px) {
    width: calc(100% - 28px);
  }
`

const Topbar = styled.header`
  min-height: 82px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e6e9e5;

  @media (max-width: 600px) {
    min-height: 68px;
  }
`

const Brand = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 11px;
  color: #17231e;
  text-decoration: none;
`

const BrandMark = styled.span`
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: #192820;

  svg {
    width: 23px;
    stroke: #c8f169;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`

const BrandCopy = styled.span`
  display: grid;
  gap: 2px;

  strong {
    font-size: 16px;
    letter-spacing: -0.5px;
  }

  small {
    color: #78827c;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.4px;
  }
`

const TopbarStatus = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #6a756e;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.05px;

  @media (max-width: 600px) {
    font-size: 8px;
    letter-spacing: 0.6px;
  }
`

const StatusPulse = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #7cb840;
  box-shadow: 0 0 0 4px #e6f0dc;
`

const PageContent = styled.main`
  padding: 48px 0 28px;

  @media (max-width: 600px) {
    padding-top: 34px;
  }
`

const Intro = styled.section`
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 30px;

  @media (max-width: 600px) {
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 22px;
  }
`

const Eyebrow = styled.p`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #708072;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 1.15px;

  @media (max-width: 600px) {
    font-size: 8px;
    letter-spacing: 0.65px;
  }
`

const EyebrowLine = styled.span`
  width: 18px;
  height: 2px;
  background: #84aa52;
`

const EyebrowSlash = styled.span`
  color: #afb7b0;
`

const PageTitle = styled.h1`
  margin: 15px 0 8px;
  color: #17231e;
  font-size: clamp(32px, 4vw, 43px);
  font-weight: 650;
  letter-spacing: -2.2px;
  line-height: 1.1;

  span {
    color: #638b3c;
  }

  @media (max-width: 600px) {
    font-size: 34px;
    letter-spacing: -1.6px;
  }
`

const IntroCopy = styled.p`
  margin: 0;
  color: #748078;
  font-size: 14px;

  @media (max-width: 600px) {
    max-width: 300px;
    font-size: 12px;
    line-height: 1.55;
  }
`

const FlowCount = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  padding-bottom: 6px;
  color: #8a948d;
  font-size: 13px;
  font-variant-numeric: tabular-nums;

  @media (max-width: 600px) {
    display: none;
  }

  strong {
    color: #17231e;
    font-size: 19px;
    font-weight: 650;
  }

  i {
    width: 24px;
    height: 1px;
    background: #cbd1cb;
  }

  small {
    margin-left: 4px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1px;
  }
`

const Workspace = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 310px;
  align-items: start;
  gap: 22px;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
  }
`

const FlowCard = styled.section`
  min-width: 0;
  padding: 30px 34px 0;
  overflow: hidden;
  border: 1px solid #e7eae6;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 12px 40px rgb(34 49 37 / 4%);

  @media (max-width: 600px) {
    padding: 23px 19px 0;
    border-radius: 12px;
  }
`

const Form = styled.form`
`

const StepPanel = styled.div`
  min-height: 305px;
  animation: panel-in 220ms ease both;

  @media (max-width: 600px) {
    min-height: 320px;
  }
`

const FormFooter = styled.div`
  min-height: 76px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px -34px 0;
  padding: 14px 34px;
  border-top: 1px solid #edf0ec;

  @media (max-width: 600px) {
    min-height: 69px;
    margin: 22px -19px 0;
    padding: 12px 19px;
    gap: 8px;
  }
`

const BackButton = styled.button`
  min-height: 39px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 13px;
  border: 1px solid #e1e6e0;
  border-radius: 7px;
  background: #fff;
  color: #68746b;
  font-size: 11px;
  font-weight: 650;
  opacity: ${({ disabled }) => (disabled ? 0 : 1)};
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};

  @media (max-width: 600px) {
    min-height: 40px;
  }
`

const FooterCaption = styled.span`
  margin: 0 auto;
  color: #a6aea7;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.75px;

  @media (max-width: 600px) {
    display: none;
  }
`

const PrimaryButton = styled.button`
  min-height: 39px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-left: auto;
  padding: 0 16px;
  border: 1px solid #192820;
  border-radius: 7px;
  background: #192820;
  color: #fff;
  font-size: 11px;
  font-weight: 650;
  transition: transform 140ms ease, background 140ms ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    background: #273b2f;
  }

  &:disabled {
    cursor: default;
    opacity: 0.7;
  }

  span {
    color: #c8f169;
    font-size: 15px;
  }

  @media (max-width: 600px) {
    min-height: 40px;
    padding: 0 13px;
  }
`

const PageFooter = styled.footer`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 24px 2px 0;
  color: #9ba49c;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.75px;

  @media (max-width: 600px) {
    font-size: 7px;
    letter-spacing: 0.35px;
  }
`

const FooterDot = styled.span`
  padding: 0 4px;
  color: #bac3b8;
`

function getStepError(step, values, lastPlayed, dailyLimit) {
  return validateStep(step, values, lastPlayed, dailyLimit)
}

export default function App() {
  const [values, setValues] = useState(initialValues)
  const [currentStep, setCurrentStep] = useState(0)
  const [errors, setErrors] = useState({})
  const [lastPlayed, setLastPlayed] = useState({ timestamp: null })
  const [outcome, setOutcome] = useState(null)
  const [failureMessage, setFailureMessage] = useState(null)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const dailyLimit = getDailyLimit()
  const cooldownStatus = getCooldownStatus(lastPlayed)

  useEffect(() => {
    setLastPlayed(getLastPlayed(values.playerId))
  }, [values.playerId])

  function handleChange(event) {
    const { name, type, checked, value } = event.currentTarget
    const nextValue = type === 'checkbox' ? checked : value

    setValues((current) => ({ ...current, [name]: nextValue }))
    setErrors({})
    setOutcome(null)
    setSuccessModalOpen(false)

    if (name === 'playerId') {
      setLastPlayed(getLastPlayed(value))
    }
  }

  function validateCurrentStep(step) {
    const history = step === 1 ? getLastPlayed(values.playerId) : lastPlayed
    if (step === 1) setLastPlayed(history)

    const error = getStepError(step, values, history, dailyLimit)
    setErrors(error ? { [error.field]: error.message } : {})
    return error
  }

  function resetForm() {
    setValues(initialValues)
    setCurrentStep(0)
    setErrors({})
    setLastPlayed({ timestamp: null })
    setOutcome(null)
    setFailureMessage(null)
    setSuccessModalOpen(false)
  }

  function advance() {
    const error = validateCurrentStep(currentStep)
    if (error) {
      setFailureMessage(error.message)
      return
    }
    setOutcome(null)
    setCurrentStep((step) => Math.min(step + 1, STEP_LABELS.length - 1))
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (currentStep < STEP_LABELS.length - 1) {
      advance()
      return
    }

    const error = validateCurrentStep(currentStep)
    if (error) {
      setFailureMessage(error.message)
      return
    }

    const timestamp = Date.now()
    const storageError = recordLastPlayed(values.playerId, timestamp)
    if (storageError) {
      setOutcome({ type: 'error', message: storageError })
      return
    }

    setLastPlayed({ timestamp })
    setErrors({})
    setOutcome({
      type: 'success',
      message: 'The demo session is recorded and its last-played time is saved in this browser. This is not connected to a real game.',
    })
    setSuccessModalOpen(true)
  }

  function goBack() {
    setOutcome(null)
    setSuccessModalOpen(false)
    setErrors({})
    setCurrentStep((step) => Math.max(step - 1, 0))
  }

  function navigateTo(step) {
    if (step >= currentStep) return
    setOutcome(null)
    setSuccessModalOpen(false)
    setErrors({})
    setCurrentStep(step)
  }

  const stepContent = [
    <ReadinessStep key="readiness" playerIds={PLAYER_IDS} values={values} errors={errors} onChange={handleChange} />,
    <DailyLimitsStep key="limits" values={values} errors={errors} dailyLimit={dailyLimit} cooldownStatus={cooldownStatus} onChange={handleChange} />,
    <GamePlanStep key="game-plan" values={values} errors={errors} onChange={handleChange} />,
    <ReviewStep key="review" values={values} outcome={outcome} cooldownStatus={cooldownStatus} />,
  ][currentStep]

  return (
    <>
      <GlobalStyles />
      {failureMessage && (
        <FailureModal
          message={failureMessage}
          onCancel={resetForm}
          onOkay={resetForm}
        />
      )}
      {successModalOpen && outcome?.type === 'success' && (
        <SuccessModal message={outcome.message} onOkay={() => setSuccessModalOpen(false)} />
      )}
      <Shell id="top">
        <Topbar>
          <Brand href="#top" aria-label="Gatekeeper home">
            <BrandMark aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none">
                <path d="M16 3 27 7v8c0 7.1-4.5 11.6-11 14C9.5 26.6 5 22.1 5 15V7l11-4Z" />
                <path d="m11.5 16 3 3 6-7" />
              </svg>
            </BrandMark>
            <BrandCopy><strong>gatekeeper</strong><small>PLAYER WELLBEING</small></BrandCopy>
          </Brand>
          <TopbarStatus><StatusPulse /> DEMO MODE</TopbarStatus>
        </Topbar>

        <PageContent>
          <Intro>
            <div>
              <Eyebrow><EyebrowLine /> RESPONSIBLE PLAY <EyebrowSlash>/</EyebrowSlash> PRE-SESSION CHECK</Eyebrow>
              <PageTitle>Pause. Check in. <span>Play aware.</span></PageTitle>
              <IntroCopy>A few quick checks to help keep every session within your limits.</IntroCopy>
            </div>
            <FlowCount><strong>{`0${currentStep + 1}`}</strong><i /> 04 <small>STEPS</small></FlowCount>
          </Intro>

          <Workspace>
            <FlowCard aria-label="Pre-session checks">
              <StepProgress currentStep={currentStep} labels={STEP_LABELS} onNavigate={navigateTo} />
              <Form onSubmit={handleSubmit} noValidate>
                <StepPanel key={currentStep}>{stepContent}</StepPanel>
                <FormFooter>
                  <BackButton type="button" onClick={goBack} disabled={currentStep === 0}><span aria-hidden="true">←</span> Back</BackButton>
                  <FooterCaption>CHECKS ARE BASED ON YOUR ANSWERS</FooterCaption>
                  {currentStep < STEP_LABELS.length - 1 ? (
                    <PrimaryButton type="button" onClick={advance}>Continue <span aria-hidden="true">→</span></PrimaryButton>
                  ) : (
                    <PrimaryButton type="submit" disabled={outcome?.type === 'success'}>
                      {outcome?.type === 'success' ? 'Session recorded' : 'Start demo session'} <span aria-hidden="true">↗</span>
                    </PrimaryButton>
                  )}
                </FormFooter>
              </Form>
            </FlowCard>

            <SessionSummary dailyLimit={dailyLimit} cooldownStatus={cooldownStatus} outcome={outcome} />
          </Workspace>

          <PageFooter>
            <span>GATEKEEPER <FooterDot>/</FooterDot> PLAYER WELLBEING</span>
            <span>RESPONSIBLE PLAY CHECK <FooterDot>·</FooterDot> DEMO</span>
          </PageFooter>
        </PageContent>
      </Shell>
    </>
  )
}

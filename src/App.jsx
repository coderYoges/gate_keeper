import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { onAuthStateChanged } from 'firebase/auth'
import { PLAYER_IDS, getSlotPlayStages, STEP_LABELS } from './constants'
import { DailyLimitsStep } from './components/DailyLimitsStep'
import { FailureModal } from './components/FailureModal'
import { FirebaseGoogleSignIn } from './components/FirebaseGoogleSignIn'
import { GamePlanStep } from './components/GamePlanStep'
import { ReadinessStep } from './components/ReadinessStep'
import { ReviewStep } from './components/ReviewStep'
import { RiskWarningModal } from './components/RiskWarningModal'
import { SessionDataPage } from './components/SessionDataPage'
import { SuccessModal } from './components/SuccessModal'
import { StepProgress } from './components/StepProgress'
import { GlobalStyles } from './styles/GlobalStyles'
import { auth, getSessionRecords, saveSessionRecord } from './firebase'
import {
  getDailyLimit,
  getPlayerSessionStatus,
  validateStep,
} from './utils/sessionChecks'
import { getTotalReturnedAmount } from './utils/sessionCalculations'
import { getSlotGameFinalBalance } from './utils/slotCalculations'

const initialValues = {
  playerId: '',
  playerDetailsConfirmed: false,
  mobileDataConfirmed: false,
  differentSimConfirmed: false,
  mentalState: '',
  sessionsToday: '',
  existingBalance: false,
  depositAmount: '',
  replenishedAgentAmount: '',
  cooldownConfirmed: false,
  gameType: '',
  gameName: '',
  rouletteBase: '',
  rouletteFinalBalance: '',
  playedGames: [],
  slotStageResults: [],
  gameStartingBalance: '',
  slotRecordConfirmed: false,
  rouletteRecordConfirmed: false,
  editingCompletedGameIndex: null,
  completedGames: [],
  slotGameStopped: false,
}

function createPlayedGame(index) {
  return {
    instance: String(index + 1),
    amount: '',
    placed: '',
    status: 'pending',
  }
}

function createSlotStageResult(stage) {
  return {
    amount: String(stage.amounts[0]),
    status: 'pending',
    winInstance: '',
    wonAmount: '',
    finalBalance: '',
  }
}

function getRecordedSlotStages(slotStageResults) {
  const earlyWinIndex = slotStageResults.findIndex((stage) => (
    stage.status === 'won' && stage.winInstance && Number(stage.winInstance) < 10
  ))
  return earlyWinIndex === -1 ? slotStageResults : slotStageResults.slice(0, earlyWinIndex + 1)
}

function getNextGameStartingBalance(completedGames, depositAmount) {
  const previousGame = completedGames[completedGames.length - 1]
  if (!previousGame) return depositAmount

  const finalBalance = previousGame.finalBalance
    ?? getSlotGameFinalBalance(
      previousGame.slotStageResults || [],
      previousGame.startingBalance ?? depositAmount,
      previousGame.gameName,
    )
  const fallbackBalance = previousGame.startingBalance
  return finalBalance === null
    ? fallbackBalance === '' || fallbackBalance === null || fallbackBalance === undefined
      ? depositAmount
      : fallbackBalance
    : String(finalBalance)
}

function createSlotGameRecord(values) {
  const slotStageResults = getRecordedSlotStages(values.slotStageResults)
  const startingBalance = values.gameStartingBalance || values.depositAmount
  return {
    gameType: 'slots',
    gameName: values.gameName,
    startingBalance,
    finalBalance: getSlotGameFinalBalance(slotStageResults, startingBalance, values.gameName),
    slotStageResults,
  }
}

function recalculateCompletedGameBalances(completedGames, depositAmount) {
  let startingBalance = depositAmount

  return completedGames.map((game) => {
    const finalBalance = game.gameType === 'slots'
      ? getSlotGameFinalBalance(game.slotStageResults || [], startingBalance, game.gameName)
      : game.finalBalance
    const updatedGame = { ...game, startingBalance, finalBalance }
    startingBalance = finalBalance ?? startingBalance
    return updatedGame
  })
}

function upsertCompletedGame(completedGames, record, editingIndex, depositAmount) {
  const updatedGames = [...completedGames]
  if (Number.isInteger(editingIndex) && editingIndex >= 0 && editingIndex < updatedGames.length) {
    updatedGames[editingIndex] = record
  } else {
    updatedGames.push(record)
  }
  return recalculateCompletedGameBalances(updatedGames, depositAmount)
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
  min-height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #26332c;

  @media (max-width: 600px) {
    min-height: 68px;
  }
`

const Brand = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 11px;
  color: #edf3ef;
  text-decoration: none;
`

const BrandMark = styled.span`
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: #c8f169;

  svg {
    width: 23px;
    stroke: #17231e;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`

const BrandCopy = styled.span`
  display: grid;
  gap: 2px;

  strong {
    font-size: 17px;
    letter-spacing: -0.5px;
  }

  small {
    color: #99a79d;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.4px;
  }
`

const TopbarStatus = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #a6b1a9;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.05px;

  @media (max-width: 600px) {
    font-size: 8px;
    letter-spacing: 0.6px;
  }
`

const TopbarLinks = styled.nav`
  display: flex;
  align-items: center;
  a {
    display: inline-flex;
    min-height: 36px;
    align-items: center;
    padding: 0 12px;
    border: 1px solid #435346;
    border-radius: 7px;
    background: #17211b;
    color: #c8f169;
    font-size: 11px;
    font-weight: 700;
    text-decoration: none;
  }

  @media (max-width: 600px) {
    order: 3;
    width: 100%;
  }
`

const StatusPulse = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #7cb840;
  box-shadow: 0 0 0 4px rgb(124 184 64 / 14%);
`

const PageContent = styled.main`
  padding: 28px 0 16px;

  @media (max-width: 600px) {
    padding-top: 20px;
  }
`

const Intro = styled.section`
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 20px;

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
  color: #9baa9e;
  font-size: 11px;
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
  color: #68756d;
`

const PageTitle = styled.h1`
  margin: 10px 0 6px;
  color: #edf3ef;
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
  color: #a1aca4;
  font-size: 15px;

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
  color: #829087;
  font-size: 13px;
  font-variant-numeric: tabular-nums;

  @media (max-width: 600px) {
    display: none;
  }

  strong {
    color: #edf3ef;
    font-size: 19px;
    font-weight: 650;
  }

  i {
    width: 24px;
    height: 1px;
    background: #3a473f;
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
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  gap: 22px;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
  }
`

const FlowCard = styled.section`
  min-width: 0;
  padding: 22px 34px 0;
  overflow: hidden;
  border: 1px solid #26332c;
  border-radius: 15px;
  background: #151d18;
  box-shadow: 0 18px 50px rgb(0 0 0 / 24%);

  @media (max-width: 600px) {
    padding: 23px 19px 0;
    border-radius: 12px;
  }
`

const Form = styled.form`
`

const StepPanel = styled.div`
  min-height: 270px;
  animation: panel-in 220ms ease both;

  @media (max-width: 600px) {
    min-height: 260px;
  }
`

const FormFooter = styled.div`
  min-height: 68px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px -34px 0;
  padding: 10px 34px;
  border-top: 1px solid #26332c;

  @media (max-width: 600px) {
    min-height: 62px;
    margin: 12px -19px 0;
    padding: 9px 19px;
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
  border: 1px solid #334138;
  border-radius: 7px;
  background: #1a2420;
  color: #abb7af;
  font-size: 12px;
  font-weight: 650;
  opacity: ${({ disabled }) => (disabled ? 0 : 1)};
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};

  @media (max-width: 600px) {
    min-height: 40px;
  }
`

const FooterCaption = styled.span`
  margin: 0 auto;
  color: #718078;
  font-size: 9px;
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
  border: 1px solid #c8f169;
  border-radius: 7px;
  background: #c8f169;
  color: #17231e;
  font-size: 12px;
  font-weight: 650;
  transition: transform 140ms ease, background 140ms ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    background: #d7f58e;
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
  padding: 12px 2px 0;
  color: #718078;
  font-size: 9px;
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

function getStepError(step, values, dailyLimit) {
  return validateStep(step, values, dailyLimit)
}

function getSessionHistoryErrorMessage(error) {
  if (error?.code === 'permission-denied') {
    return 'Firestore denied the session-history check. Publish the updated owner-scoped rules for game-users.'
  }
  return 'Could not load saved sessions to verify the current session and cooling period.'
}

export default function App() {
  const [values, setValues] = useState(initialValues)
  const [showSavedData, setShowSavedData] = useState(() => window.location.hash === '#/data')
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [authStateError, setAuthStateError] = useState('')
  const [sessionRecords, setSessionRecords] = useState([])
  const [sessionHistoryLoading, setSessionHistoryLoading] = useState(false)
  const [sessionHistoryError, setSessionHistoryError] = useState('')
  const [sessionHistoryRefreshVersion, setSessionHistoryRefreshVersion] = useState(0)
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [savingSession, setSavingSession] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const [errors, setErrors] = useState({})
  const [outcome, setOutcome] = useState(null)
  const [failureMessage, setFailureMessage] = useState(null)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [riskWarningOpen, setRiskWarningOpen] = useState(false)
  const saveInProgressRef = useRef(false)
  const sessionIdRef = useRef(null)
  const dailyLimit = getDailyLimit(currentTime)
  const sessionStatus = getPlayerSessionStatus(sessionRecords, values.playerId, currentTime)
  const historyReady = !sessionHistoryLoading && !sessionHistoryError
  const sessionValues = {
    ...values,
    sessionsToday: historyReady ? String(sessionStatus.currentSessionNumber) : '',
    cooldownConfirmed: historyReady && sessionStatus.cooldownConfirmed,
  }
  const cooldownStatus = sessionHistoryLoading
    ? { tone: 'neutral', text: 'Checking saved session history…', remainingMs: null }
    : sessionHistoryError
      ? { tone: 'error', text: 'Cooling period could not be verified.', remainingMs: null }
      : sessionStatus.cooldownStatus

  useEffect(() => {
    function handleHashChange() {
      setShowSavedData(window.location.hash === '#/data')
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    const timerId = window.setInterval(() => setCurrentTime(new Date()), 30000)
    return () => window.clearInterval(timerId)
  }, [])

  useEffect(() => {
    if (!firebaseUser || !values.playerId) {
      setSessionRecords([])
      setSessionHistoryLoading(false)
      setSessionHistoryError('')
      return undefined
    }

    let active = true
    setSessionRecords([])
    setSessionHistoryLoading(true)
    setSessionHistoryError('')

    getSessionRecords(firebaseUser.uid)
      .then((records) => {
        if (active) setSessionRecords(records)
      })
      .catch((error) => {
        console.error('Firebase session history could not be loaded.', error)
        if (active) setSessionHistoryError(getSessionHistoryErrorMessage(error))
      })
      .finally(() => {
        if (active) setSessionHistoryLoading(false)
      })

    return () => {
      active = false
    }
  }, [firebaseUser, values.playerId, sessionHistoryRefreshVersion])

  useEffect(() => onAuthStateChanged(
    auth,
    (user) => {
      setFirebaseUser(user)
      setAuthStateError('')
      setAuthReady(true)
    },
    (error) => {
      console.error('Firebase authentication state could not be loaded.', error)
      setAuthStateError('Could not check the existing Firebase sign-in. Reload and try again.')
      setAuthReady(true)
    },
  ), [])

  function handleChange(event) {
    const { name, type, checked, value } = event.currentTarget
    if (name === 'depositAmount' && value !== '' && !/^\d+$/.test(value)) return
    if (name === 'replenishedAgentAmount' && value !== '' && !/^\d*\.?\d{0,2}$/.test(value)) return

    const nextValue = type === 'checkbox' ? checked : value

    setValues((current) => ({
      ...current,
      [name]: nextValue,
      ...(name === 'playerId' ? { playerDetailsConfirmed: false } : {}),
      ...(name === 'gameType' ? {
        gameName: '',
        rouletteBase: '',
        rouletteFinalBalance: '',
        playedGames: [],
        slotStageResults: [],
        gameStartingBalance: '',
        slotRecordConfirmed: false,
        rouletteRecordConfirmed: false,
        slotGameStopped: false,
      } : {}),
      ...(name === 'gameName' ? {
        gameStartingBalance: value
          ? getNextGameStartingBalance(current.completedGames, current.depositAmount)
          : '',
      } : {}),
      ...(name === 'gameName' && current.gameType === 'slots' ? {
        slotStageResults: value ? getSlotPlayStages(value).map(createSlotStageResult) : [],
        slotRecordConfirmed: false,
        slotGameStopped: false,
      } : {}),
      ...(name === 'gameName' && current.gameType === 'roulette' ? {
        playedGames: [],
        rouletteFinalBalance: '',
        rouletteRecordConfirmed: false,
      } : {}),
      ...(name === 'rouletteFinalBalance' ? {
        rouletteRecordConfirmed: false,
      } : {}),
    }))
    setErrors({})
    setOutcome(null)
    setSuccessModalOpen(false)
  }

  function cancelEditCompletedGame() {
    setValues((current) => ({
      ...current,
      editingCompletedGameIndex: null,
      gameType: '',
      gameName: '',
      rouletteBase: '',
      rouletteFinalBalance: '',
      playedGames: [],
      slotStageResults: [],
      gameStartingBalance: '',
      slotRecordConfirmed: false,
      rouletteRecordConfirmed: false,
      slotGameStopped: false,
    }))
    setErrors({})
  }

  function updatePlayedGame(index, field, value) {
    setValues((current) => {
      const playedGames = current.playedGames.map((game, gameIndex) => (
        gameIndex === index ? { ...game, [field]: value } : game
      ))

      return { ...current, playedGames, rouletteRecordConfirmed: false }
    })
    setErrors({})
    setOutcome(null)
    setSuccessModalOpen(false)
  }

  function updateSlotStage(index, field, value) {
    setValues((current) => {
      const slotStageResults = current.slotStageResults.map((stage, stageIndex) => (
        stageIndex === index
          ? field === 'status'
            ? { ...stage, status: value, winInstance: '', wonAmount: '', finalBalance: '' }
            : { ...stage, [field]: value }
          : stage
      ))
      const slotGameStopped = slotStageResults.some((stage) => (
        stage.status === 'won' && stage.winInstance && Number(stage.winInstance) < 10
      ))

      return { ...current, slotStageResults, slotRecordConfirmed: false, slotGameStopped }
    })
    setErrors({})
    setOutcome(null)
    setSuccessModalOpen(false)
  }

  function addSlotRecord() {
    const error = getStepError(2, {
      ...values,
      allowEarlyWinRecord: true,
      slotGameStopped: false,
      slotRecordConfirmed: true,
    }, dailyLimit)
    setErrors(error ? { [error.field]: error.message } : {})
    if (error) return false

    setValues((current) => ({
      ...current,
      completedGames: upsertCompletedGame(
        current.completedGames,
        createSlotGameRecord(current),
        current.editingCompletedGameIndex,
        current.depositAmount,
      ),
      gameType: '',
      gameName: '',
      rouletteBase: '',
      rouletteFinalBalance: '',
      playedGames: [],
      slotStageResults: [],
      gameStartingBalance: '',
      slotRecordConfirmed: false,
      rouletteRecordConfirmed: false,
      editingCompletedGameIndex: null,
      slotGameStopped: false,
    }))
    return true
  }

  function addRouletteRecord() {
    const error = getStepError(2, { ...values, rouletteRecordConfirmed: true }, dailyLimit)
    setErrors(error ? { [error.field]: error.message } : {})
    if (error) return false

    setValues((current) => ({
      ...current,
      completedGames: upsertCompletedGame(
        current.completedGames,
        {
          gameType: 'roulette',
          gameName: current.gameName,
          rouletteBase: current.rouletteBase,
          startingBalance: current.gameStartingBalance || current.depositAmount,
          finalBalance: Number(current.rouletteFinalBalance),
          playedGames: current.playedGames,
        },
        current.editingCompletedGameIndex,
        current.depositAmount,
      ),
      gameType: '',
      gameName: '',
      rouletteBase: '',
      rouletteFinalBalance: '',
      playedGames: [],
      slotStageResults: [],
      gameStartingBalance: '',
      slotRecordConfirmed: false,
      rouletteRecordConfirmed: false,
      editingCompletedGameIndex: null,
      slotGameStopped: false,
    }))
    return true
  }

  function addPlayedGame() {
    setValues((current) => {
      const lastGame = current.playedGames[current.playedGames.length - 1]
      if (current.gameType !== 'roulette' || !current.gameName.trim() || current.playedGames.length >= 40) return current
      if (lastGame && (lastGame.status === 'pending' || !lastGame.placed.trim())) return current

      return {
        ...current,
        playedGames: [...current.playedGames, createPlayedGame(current.playedGames.length)],
      }
    })
    setErrors({})
    setOutcome(null)
    setSuccessModalOpen(false)
  }

  function removePlayedGame(index) {
    setValues((current) => {
      if (index !== current.playedGames.length - 1) return current
      const playedGames = current.playedGames.slice(0, -1)
      return { ...current, playedGames }
    })
    setErrors({})
    setOutcome(null)
    setSuccessModalOpen(false)
  }

  function removeCompletedGame(index) {
    setValues((current) => {
      if (index < 0 || index >= current.completedGames.length) return current
      const completedGames = current.completedGames.filter((_, gameIndex) => gameIndex !== index)
      return {
        ...current,
        completedGames: recalculateCompletedGameBalances(completedGames, current.depositAmount),
        editingCompletedGameIndex: Number.isInteger(current.editingCompletedGameIndex)
          ? current.editingCompletedGameIndex > index
            ? current.editingCompletedGameIndex - 1
            : current.editingCompletedGameIndex === index
              ? null
              : current.editingCompletedGameIndex
          : null,
      }
    })
    setErrors({})
    setOutcome(null)
    setSuccessModalOpen(false)
  }

  function editCompletedGame(index) {
    setValues((current) => {
      const record = current.completedGames[index]
      if (!record) return current
      const slotStageResults = record.slotStageResults || []

      return {
        ...current,
        editingCompletedGameIndex: index,
        gameType: record.gameType,
        gameName: record.gameName,
        rouletteBase: record.rouletteBase || '',
        rouletteFinalBalance: record.gameType === 'roulette' ? String(record.finalBalance) : '',
        playedGames: record.playedGames || [],
        slotStageResults,
        gameStartingBalance: String(record.startingBalance ?? current.depositAmount),
        slotRecordConfirmed: false,
        rouletteRecordConfirmed: false,
        slotGameStopped: slotStageResults.some((stage) => (
          stage.status === 'won' && stage.winInstance && Number(stage.winInstance) < 10
        )),
      }
    })
    setErrors({})
    setOutcome(null)
    setSuccessModalOpen(false)
  }

  function validateCurrentStep(step) {
    if (step === 1 && (sessionHistoryLoading || sessionHistoryError)) {
      const error = {
        field: 'sessionsToday',
        message: sessionHistoryLoading
          ? 'Wait while saved session history is checked.'
          : sessionHistoryError,
      }
      setErrors({ [error.field]: error.message })
      return error
    }

    const now = new Date()
    const currentStatus = getPlayerSessionStatus(sessionRecords, values.playerId, now)
    const validationValues = {
      ...values,
      sessionsToday: String(currentStatus.currentSessionNumber),
      cooldownConfirmed: currentStatus.cooldownConfirmed,
    }
    const error = getStepError(step, validationValues, getDailyLimit(now))
    setErrors(error ? { [error.field]: error.message } : {})
    return error
  }

  function resetForm() {
    setValues(initialValues)
    setCurrentStep(0)
    setErrors({})
    setOutcome(null)
    setFailureMessage(null)
    setSuccessModalOpen(false)
    setRiskWarningOpen(false)
  }

  function advance() {
    const error = validateCurrentStep(currentStep)
    if (error) {
      if (currentStep === 1 && (sessionHistoryLoading || sessionHistoryError)) return
      if (['playedGames', 'rouletteFinalBalance', 'slotGameStopped', 'slotStageResults'].includes(error.field)) return
      setFailureMessage(error.message)
      return
    }
    if (currentStep === 1) {
      setRiskWarningOpen(true)
      return
    }
    setOutcome(null)
    setCurrentStep((step) => Math.min(step + 1, STEP_LABELS.length - 1))
  }

  function proceedFromRiskWarning() {
    setRiskWarningOpen(false)
    setOutcome(null)
    setCurrentStep(2)
  }

  async function continueFromReview() {
    if (saveInProgressRef.current) return

    const error = validateCurrentStep(currentStep)
    if (error) {
      setFailureMessage(error.message)
      return
    }

    setErrors({})
    setSaveError('')
    if (!authReady) {
      setSaveError('Firebase is still checking your sign-in. Please try again in a moment.')
      return
    }
    if (!firebaseUser) {
      setSaveError(authStateError || 'No existing Firebase sign-in was found. Sign in with your configured provider, then try saving again.')
      return
    }

    const lastGame = values.completedGames[values.completedGames.length - 1]
    const withdrawnAmount = Number(lastGame?.finalBalance)
    if (!lastGame || lastGame.finalBalance === null || lastGame.finalBalance === undefined
      || lastGame.finalBalance === '' || !Number.isFinite(withdrawnAmount)) {
      setSaveError('Record a valid final balance for the last game before saving.')
      return
    }

    const amountReturned = getTotalReturnedAmount(values.completedGames || [])
    const balanceInGameAccount = Number(values.depositAmount) - amountReturned
    const maxAgentAmount = amountReturned * 0.5
    const replenishedAgentAmount = values.replenishedAgentAmount === ''
      ? maxAgentAmount
      : Number(values.replenishedAgentAmount)
    if (!Number.isFinite(replenishedAgentAmount)
      || replenishedAgentAmount < 0
      || replenishedAgentAmount > maxAgentAmount) {
      setSaveError(`Enter an agent amount between ₹0 and the maximum of ₹${maxAgentAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}.`)
      return
    }

    saveInProgressRef.current = true
    setSavingSession(true)
    try {
      const latestRecords = await getSessionRecords(firebaseUser.uid)
      const checkedAt = new Date()
      const latestStatus = getPlayerSessionStatus(latestRecords, values.playerId, checkedAt)
      const currentDailyLimit = getDailyLimit(checkedAt)
      setSessionRecords(latestRecords)
      setCurrentTime(checkedAt)

      if (latestStatus.currentSessionNumber > currentDailyLimit) {
        setSaveError(`Today’s saved session count has reached the limit of ${currentDailyLimit}. Do not start another session today.`)
        return
      }
      if (!latestStatus.cooldownConfirmed) {
        setSaveError(latestStatus.cooldownStatus.text)
        return
      }

      if (!sessionIdRef.current) sessionIdRef.current = crypto.randomUUID()

      await saveSessionRecord(firebaseUser.uid, {
        sessionId: sessionIdRef.current,
        playerId: values.playerId,
        sessionNumber: latestStatus.currentSessionNumber,
        existingBalance: Boolean(values.existingBalance),
        depositAmount: Number(values.depositAmount),
        amountReturned,
        balanceInGameAccount,
        withdrawnAmount,
        cooldownConfirmed: latestStatus.cooldownConfirmed,
        mobileDataConfirmed: Boolean(values.mobileDataConfirmed),
        differentSimConfirmed: Boolean(values.differentSimConfirmed),
        games: values.completedGames.map((game) => ({
          gameType: game.gameType,
          gameName: game.gameName,
          startingBalance: game.startingBalance ?? null,
          finalBalance: game.finalBalance ?? null,
          rouletteBase: game.rouletteBase ?? null,
          playedGames: game.playedGames || [],
          slotStageResults: game.slotStageResults || [],
        })),
      })

      setOutcome({
        type: 'success',
        message: 'Your session plan was saved successfully. It is a pleasure to have you!',
      })
      setSuccessModalOpen(true)
    } catch (saveError) {
      console.error('Firebase could not save the session record.', saveError)
      setSaveError(saveError?.code === 'auth/user-mismatch'
        ? 'Your Firebase sign-in changed. Sign in again, then retry.'
        : saveError?.code === 'permission-denied'
          ? 'Firestore denied the session-history check or save. Publish the updated owner-scoped rules for game-users, then try again.'
          : 'Could not save your session to Firestore. Check the connection and Firebase setup, then try again. Your session has not been marked successful.')
    } finally {
      setSavingSession(false)
      saveInProgressRef.current = false
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (currentStep < STEP_LABELS.length - 1) {
      advance()
      return
    }

    continueFromReview()
  }

  function goBack() {
    setOutcome(null)
    setSuccessModalOpen(false)
    setRiskWarningOpen(false)
    setErrors({})
    setCurrentStep((step) => Math.max(step - 1, 0))
  }

  function navigateTo(step) {
    if (step >= currentStep) return
    setOutcome(null)
    setSuccessModalOpen(false)
    setRiskWarningOpen(false)
    setErrors({})
    setCurrentStep(step)
  }

  const stepContent = [
    <ReadinessStep key="readiness" playerIds={PLAYER_IDS} values={values} errors={errors} onChange={handleChange} />,
    <DailyLimitsStep
      key="limits"
      values={sessionValues}
      errors={errors}
      dailyLimit={dailyLimit}
      cooldownStatus={cooldownStatus}
      sessionHistoryLoading={sessionHistoryLoading}
      sessionHistoryError={sessionHistoryError}
      onRetrySessionHistory={() => setSessionHistoryRefreshVersion((version) => version + 1)}
      onChange={handleChange}
    />,
    <GamePlanStep
      key="game-plan"
      values={values}
      errors={errors}
      onChange={handleChange}
      onPlayedGameChange={updatePlayedGame}
      onSlotStageChange={updateSlotStage}
      onAddSlotRecord={addSlotRecord}
      onAddRouletteRecord={addRouletteRecord}
      onAddPlayedGame={addPlayedGame}
      onRemovePlayedGame={removePlayedGame}
      onRemoveCompletedGame={removeCompletedGame}
      onEditCompletedGame={editCompletedGame}
      onCancelCompletedGameEdit={cancelEditCompletedGame}
    />,
    <ReviewStep
      key="review"
      values={sessionValues}
      onChange={handleChange}
      outcome={outcome}
      onContinue={continueFromReview}
      continueDisabled={outcome?.type === 'success' || savingSession}
      saving={savingSession}
      saveError={saveError}
    />,
  ][currentStep]

  if (!authReady || !firebaseUser) {
    return (
      <>
        <GlobalStyles />
        <FirebaseGoogleSignIn checkingAuth={!authReady} error={authStateError} />
      </>
    )
  }

  if (showSavedData) {
    return (
      <>
        <GlobalStyles />
        <SessionDataPage user={firebaseUser} />
      </>
    )
  }

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
      {riskWarningOpen && (
        <RiskWarningModal
          onCancel={() => setRiskWarningOpen(false)}
          onProceed={proceedFromRiskWarning}
        />
      )}
      {successModalOpen && outcome?.type === 'success' && (
        <SuccessModal
          playerName={PLAYER_IDS.find((player) => player.playerId === values.playerId)?.playerName || 'there'}
          message={outcome.message}
          onOkay={() => window.location.reload()}
        />
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
          <TopbarLinks aria-label="Main navigation">
            <a href="#/data">Transfer history</a>
          </TopbarLinks>
          <TopbarStatus><StatusPulse /> SYSTEM READY</TopbarStatus>
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
                  {currentStep < STEP_LABELS.length - 1 && (
                    <BackButton type="button" onClick={goBack} disabled={currentStep === 0}>
                      <span aria-hidden="true">←</span> Back
                    </BackButton>
                  )}
                  <FooterCaption>CHECKS ARE BASED ON YOUR ANSWERS</FooterCaption>
                  {currentStep < STEP_LABELS.length - 1 ? (
                    <PrimaryButton type="button" onClick={advance}>Continue <span aria-hidden="true">→</span></PrimaryButton>
                  ) : null}
                </FormFooter>
              </Form>
            </FlowCard>

          </Workspace>

          <PageFooter>
            <span>GATEKEEPER <FooterDot>/</FooterDot> PLAYER WELLBEING</span>
            <span>RESPONSIBLE PLAY CHECK</span>
          </PageFooter>
        </PageContent>
      </Shell>
    </>
  )
}

import { DAILY_SESSION_LIMITS, PLAYER_IDS, SESSION_RULES } from '../constants'

const LAST_PLAYED_STORAGE_KEY = 'gatekeeper:last-played:'

export function getDailyLimit(date = new Date()) {
  const day = date.getDay()
  return day === 0 || day === 6 ? DAILY_SESSION_LIMITS.weekend : DAILY_SESSION_LIMITS.weekday
}

export function getLastPlayed(playerId) {
  if (!playerId) return { timestamp: null }

  try {
    const storedTime = localStorage.getItem(`${LAST_PLAYED_STORAGE_KEY}${playerId}`)
    if (storedTime === null) return { timestamp: null }

    const timestamp = Number(storedTime)
    if (!Number.isFinite(timestamp) || timestamp <= 0) {
      return { error: 'The saved last-played time is invalid. Clear this demo’s saved site data to continue.' }
    }

    return { timestamp }
  } catch {
    return { error: 'Browser storage is unavailable, so the last-played time cannot be verified.' }
  }
}

export function recordLastPlayed(playerId, timestamp = Date.now()) {
  try {
    localStorage.setItem(`${LAST_PLAYED_STORAGE_KEY}${playerId}`, String(timestamp))
    return null
  } catch {
    return 'Browser storage is unavailable, so the demo session could not be recorded.'
  }
}

export function formatRemainingTime(milliseconds) {
  const totalMinutes = Math.ceil(milliseconds / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`
}

export function getCooldownStatus(lastPlayed, now = Date.now()) {
  if (lastPlayed.error) return { tone: 'error', text: lastPlayed.error, remainingMs: null }
  if (lastPlayed.timestamp === null) {
    return { tone: 'clear', text: 'No demo session has been recorded for this player ID.', remainingMs: 0 }
  }

  const playedAt = new Date(lastPlayed.timestamp)
  if (!Number.isFinite(playedAt.getTime()) || playedAt.getTime() > now) {
    return { tone: 'error', text: 'The saved last-played time is invalid or in the future.', remainingMs: null }
  }

  const remainingMs = SESSION_RULES.cooldownMs - (now - lastPlayed.timestamp)
  const formattedTime = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(playedAt)

  if (remainingMs > 0) {
    return {
      tone: 'cooling',
      text: `Last played ${formattedTime}. Wait ${formatRemainingTime(remainingMs)} before starting another session.`,
      remainingMs,
    }
  }

  return {
    tone: 'clear',
    text: `Last played ${formattedTime}. The 3-hour cooling period is complete.`,
    remainingMs: 0,
  }
}

export function validateStep(step, values, lastPlayed, dailyLimit) {
  if (step === 0) {
    if (!PLAYER_IDS.includes(values.playerId)) {
      return { field: 'playerId', message: 'Select a player ID from the list.' }
    }
    if (!values.mentalState) {
      return { field: 'mentalState', message: 'Select how you are feeling before continuing.' }
    }
    if (values.mentalState !== 'ready') {
      return { field: 'mentalState', message: 'Please don’t start a session if you feel tired, stressed, angry, or distracted.' }
    }
  }

  if (step === 1) {
    const sessions = Number(values.sessionsToday)
    if (values.sessionsToday === '' || !Number.isInteger(sessions) || sessions < 0) {
      return { field: 'sessionsToday', message: 'Enter a whole number of sessions already played today.' }
    }
    if (sessions >= dailyLimit) {
      return { field: 'sessionsToday', message: `You’ve reached today’s limit of ${dailyLimit} sessions. Please don’t start another session today.` }
    }

    const deposit = Number(values.depositAmount)
    if (!Number.isFinite(deposit) || deposit <= 0) {
      return { field: 'depositAmount', message: 'Enter a deposit greater than ₹0.' }
    }
    if (deposit > SESSION_RULES.depositMax) {
      return { field: 'depositAmount', message: 'The deposit limit is ₹15,000 per user per session.' }
    }

    if (lastPlayed.error) return { field: 'cooldown', message: lastPlayed.error }
    if (lastPlayed.timestamp !== null) {
      const elapsed = Date.now() - lastPlayed.timestamp
      if (elapsed < 0) {
        return { field: 'cooldown', message: 'The saved last-played time is in the future. Clear this demo’s saved site data to continue.' }
      }
      if (elapsed < SESSION_RULES.cooldownMs) {
        return {
          field: 'cooldown',
          message: `The 3-hour cooling period has not ended. Wait ${formatRemainingTime(SESSION_RULES.cooldownMs - elapsed)} before starting another session.`,
        }
      }
    }
  }

  if (step === 2) {
    if (!['slots', 'roulette', 'both'].includes(values.gameType)) {
      return { field: 'gameType', message: 'Choose the games planned for this session.' }
    }
    if (!values.positionConfirm) {
      return { field: 'positionConfirm', message: 'Confirm that you will play only in your assigned position.' }
    }

    if (values.gameType === 'slots' || values.gameType === 'both') {
      const bet = Number(values.slotBet)
      const slotGames = Number(values.slotGames)
      if (!Number.isFinite(bet) || bet <= 0 || bet > SESSION_RULES.slotBetMax) {
        return { field: 'slotBet', message: 'Slot amounts must be greater than ₹0 and no more than ₹50.' }
      }
      if (!Number.isInteger(slotGames) || slotGames < 1 || slotGames > SESSION_RULES.slotGamesMax) {
        return { field: 'slotGames', message: 'Choose between 1 and 3 slot games per session.' }
      }
    }

    if (values.gameType === 'roulette' || values.gameType === 'both') {
      const base = Number(values.rouletteBase)
      if (!Number.isFinite(base) || base <= 0 || base > SESSION_RULES.rouletteBaseMax) {
        return { field: 'rouletteBase', message: 'The roulette base amount must be greater than ₹0 and no more than ₹200.' }
      }
    }
  }

  if (step === 3) {
    if (!values.stopLossCheck) {
      return { field: 'stopLossCheck', message: 'Confirm the 50% stop-loss rule before continuing.' }
    }
    if (!values.stopWinCheck) {
      return { field: 'stopWinCheck', message: 'Confirm the ₹1,000 stop-win rule before continuing.' }
    }
  }

  return null
}

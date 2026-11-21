import { DAILY_SESSION_LIMITS, PLAYER_IDS, SESSION_RULES } from '../constants.js'

export function getDailyLimit(date = new Date()) {
  const day = date.getDay()
  return day === 0 || day === 6 ? DAILY_SESSION_LIMITS.weekend : DAILY_SESSION_LIMITS.weekday
}

export function getCooldownStatus(cooldownConfirmed) {
  return cooldownConfirmed
    ? { tone: 'clear', text: 'You confirmed that at least 3 hours have passed since your last session.', remainingMs: 0 }
    : { tone: 'neutral', text: 'Confirm that at least 3 hours have passed since your last session.', remainingMs: null }
}

export function validateStep(step, values, dailyLimit) {
  if (step === 0) {
    if (!PLAYER_IDS.some((player) => player.playerId === values.playerId)) {
      return { field: 'playerId', message: 'Select a player from the list.' }
    }
    if (!values.playerDetailsConfirmed) {
      return { field: 'playerDetailsConfirmed', message: 'Confirm that the device and location shown match your profile.' }
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
    if (values.sessionsToday === '' || !Number.isInteger(sessions) || sessions < 1) {
      return { field: 'sessionsToday', message: 'Enter the current session number for today, starting from 1.' }
    }
    if (sessions > dailyLimit) {
      return { field: 'sessionsToday', message: `This session number exceeds today’s limit of ${dailyLimit} sessions.` }
    }

    const deposit = Number(values.depositAmount)
    if (!Number.isFinite(deposit) || deposit <= 0) {
      return { field: 'depositAmount', message: 'Enter a deposit greater than ₹0.' }
    }
    if (deposit > SESSION_RULES.depositMax) {
      return { field: 'depositAmount', message: 'The deposit limit is ₹15,000 per user per session.' }
    }

    if (!values.cooldownConfirmed) {
      return {
        field: 'cooldownConfirmed',
        message: 'Confirm that at least 3 hours have passed since your last session.',
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

    if (!values.stopLossCheck) {
      return { field: 'stopLossCheck', message: 'Confirm the 50% stop-loss rule before continuing.' }
    }
    if (!values.stopWinCheck) {
      return { field: 'stopWinCheck', message: 'Confirm the ₹1,000 stop-win rule before continuing.' }
    }
  }

  return null
}

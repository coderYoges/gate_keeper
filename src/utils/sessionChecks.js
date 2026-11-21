import { DAILY_SESSION_LIMITS, PLAYER_IDS, SESSION_RULES, SLOT_PLAY_STAGES } from '../constants.js'

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
    if (!Number.isInteger(deposit) || deposit <= 0) {
      return { field: 'depositAmount', message: 'Enter a whole-rupee deposit greater than ₹0.' }
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
    if (!values.gameName?.trim()) {
      return { field: 'gameName', message: 'Enter the name of the game you plan to play.' }
    }
    if (values.gameType === 'slots') {
      if (values.slotGameStopped) {
        return { field: 'slotGameStopped', message: 'Start a new slot game after recording an early win.' }
      }
      const requiredPlays = SLOT_PLAY_STAGES.reduce((total, stage) => total + stage.plays, 0)
      if (values.playedGames.length !== requiredPlays) {
        return { field: 'playedGames', message: `Record all ${requiredPlays} slot instances before continuing.` }
      }
      for (let index = 0; index < values.playedGames.length; index += 1) {
        const play = values.playedGames[index]
        const stage = SLOT_PLAY_STAGES[Math.floor(index / 10)]
        if (!stage.amounts.includes(Number(play.amount))) {
          return { field: 'playedGames', message: `Choose an allowed amount for slot instance ${index + 1}.` }
        }
        if (!play.placed.trim()) {
          return { field: 'playedGames', message: `Enter what was placed for slot instance ${index + 1}.` }
        }
        if (!['won', 'lost'].includes(play.status)) {
          return { field: 'playedGames', message: `Record the status for slot instance ${index + 1}.` }
        }
        if (play.status === 'won' && index % 10 < 9) {
          return { field: 'slotGameStopped', message: 'A win before completing a 10-play stage requires starting a new slot game.' }
        }
      }
    }

    if (values.gameType === 'roulette' || values.gameType === 'both') {
      const base = Number(values.rouletteBase)
      if (!Number.isFinite(base) || base <= 0 || base > SESSION_RULES.rouletteBaseMax) {
        return { field: 'rouletteBase', message: 'The roulette base amount must be greater than ₹0 and no more than ₹200.' }
      }
    }

  }

  return null
}

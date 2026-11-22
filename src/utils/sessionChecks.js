import {
  DAILY_SESSION_LIMITS,
  MAX_SLOT_GAMES_PER_SESSION,
  SESSION_RULES,
  getSlotPlayStages,
} from '../constants.js'
import { getGameReturnedAmount } from './sessionCalculations.js'

export function getDailyLimit(date = new Date()) {
  const day = date.getDay()
  return day === 0 || day === 6 ? DAILY_SESSION_LIMITS.weekend : DAILY_SESSION_LIMITS.weekday
}

function getSessionDate(value) {
  if (!value) return null
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatRemainingTime(remainingMs) {
  const totalMinutes = Math.ceil(remainingMs / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

export function getPlayerSessionStatus(records, playerId, now = new Date()) {
  if (!playerId) {
    return {
      currentSessionNumber: '',
      cooldownConfirmed: false,
      cooldownStatus: {
        tone: 'neutral',
        text: 'Select a player to check saved session history.',
        remainingMs: null,
      },
    }
  }

  const playerSessions = (Array.isArray(records) ? records : [])
    .filter((record) => record.playerId === playerId)
    .map((record) => getSessionDate(record.createdAt))
    .filter(Boolean)
  const sessionsToday = playerSessions.filter((sessionDate) => (
    sessionDate.getFullYear() === now.getFullYear()
    && sessionDate.getMonth() === now.getMonth()
    && sessionDate.getDate() === now.getDate()
  )).length
  const lastSessionAt = playerSessions.reduce(
    (latest, sessionDate) => (!latest || sessionDate > latest ? sessionDate : latest),
    null,
  )

  const isWeekend = now.getDay() === 0 || now.getDay() === 6
  const cooldownHours = isWeekend && now.getHours() >= SESSION_RULES.weekendNightStartHour
    ? SESSION_RULES.weekendNightCooldownHours
    : SESSION_RULES.weekdayCooldownHours
  const requiredCooldownMs = cooldownHours * 60 * 60 * 1000
  const remainingMs = lastSessionAt
    ? Math.max(0, lastSessionAt.getTime() + requiredCooldownMs - now.getTime())
    : 0
  const cooldownConfirmed = remainingMs === 0
  const cooldownText = !lastSessionAt
    ? 'No previous session is saved for this player. The cooling-period check is clear.'
    : cooldownConfirmed
      ? `Cooling-period check is clear. The ${cooldownHours}-hour break has passed since the last saved session.`
      : `Cooling period active. Wait ${formatRemainingTime(remainingMs)} more; the current requirement is ${cooldownHours} hour${cooldownHours === 1 ? '' : 's'}.`

  return {
    currentSessionNumber: sessionsToday + 1,
    cooldownConfirmed,
    cooldownStatus: {
      tone: cooldownConfirmed ? 'clear' : 'cooling',
      text: cooldownText,
      remainingMs,
    },
  }
}

export function getSessionStopStatus(finalBalance, depositAmount) {
  if (finalBalance === '' || finalBalance === null || finalBalance === undefined) return null

  const balance = Number(finalBalance)
  const deposit = Number(depositAmount)
  if (!Number.isFinite(balance) || !Number.isFinite(deposit) || deposit <= 0) return null

  return {
    stopLossReached: balance <= deposit * (1 - SESSION_RULES.stopLossPercent),
    stopProfitReached: balance >= deposit + SESSION_RULES.stopWin,
  }
}

export function getSessionStopReason(completedGames, depositAmount) {
  const deposit = Number(depositAmount)
  let totalReturned = 0

  for (const game of completedGames) {
    const status = getSessionStopStatus(game.finalBalance, depositAmount)
    if (status?.stopLossReached) return 'loss'
    if (status?.stopProfitReached) return 'profit'

    totalReturned += getGameReturnedAmount(game)
    if (Number.isFinite(deposit) && deposit > 0 && totalReturned >= deposit) return 'returned'
  }
  return null
}

export function validateStep(step, values, dailyLimit, playerIds = []) {
  if (step === 0) {
    if (!playerIds.some((player) => player.playerId === values.playerId)) {
      return { field: 'playerId', message: 'Select a player from the list.' }
    }
    if (!values.playerDetailsConfirmed) {
      return { field: 'playerDetailsConfirmed', message: 'Confirm that the device and location shown match your profile.' }
    }
    if (!values.mobileDataConfirmed) {
      return { field: 'mobileDataConfirmed', message: 'Confirm that you are using mobile data only, without Wi-Fi or a hotspot.' }
    }
    if (!values.differentSimConfirmed) {
      return { field: 'differentSimConfirmed', message: 'Confirm that you are not using the SIM card used by the previous user.' }
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
    if (values.existingBalance && deposit < 300) {
      return { field: 'depositAmount', message: 'Enter a deposit of at least ₹300 when your account already has a balance.' }
    }
    if (deposit > SESSION_RULES.depositMax) {
      return { field: 'depositAmount', message: 'The deposit limit is ₹15,000 per user per session.' }
    }

    if (!values.cooldownConfirmed) {
      return {
        field: 'cooldownConfirmed',
        message: 'The cooling period has not ended. Wait for the saved-session check to clear before continuing.',
      }
    }
  }

  if (step === 2) {
    const completedGames = values.completedGames || []
    const editingIndex = values.editingCompletedGameIndex
    const isEditing = Number.isInteger(editingIndex)
    const stopReason = isEditing ? null : getSessionStopReason(completedGames, values.depositAmount)
    if (stopReason && values.gameType) {
      return {
        field: 'gameType',
        message: stopReason === 'loss'
          ? 'The session stop-loss limit has been reached. Do not start another game.'
          : stopReason === 'profit'
            ? 'The session stop-profit limit has been reached. Do not start another game.'
            : 'Total returned has reached your initial deposit. Please stop playing.',
      }
    }
    if (!values.gameType && completedGames.length > 0) return null
    if (!['slots', 'roulette', 'both'].includes(values.gameType)) {
      return { field: 'gameType', message: 'Choose the games planned for this session.' }
    }
    if (!values.gameName?.trim()) {
      return { field: 'gameName', message: 'Enter the name of the game you plan to play.' }
    }
    if (values.gameType === 'slots') {
      if (!isEditing) {
        const completedSlotCount = completedGames.filter((game) => game.gameType === 'slots').length
        const lastGame = completedGames[completedGames.length - 1]
        if (completedGames.length === 0) {
          return { field: 'gameType', message: 'Start the session with a roulette game before playing slots.' }
        }
        if (completedSlotCount >= MAX_SLOT_GAMES_PER_SESSION) {
          return { field: 'gameType', message: `Only ${MAX_SLOT_GAMES_PER_SESSION} slot games are allowed in a session.` }
        }
        if (lastGame?.gameType === 'slots') {
          return { field: 'gameType', message: 'Record a roulette game before playing another slot game.' }
        }
      }
      if (completedGames.some((game, index) => (
        index !== editingIndex && game.gameType === 'slots' && game.gameName === values.gameName
      ))) {
        return { field: 'gameName', message: 'This slot game has already been played in this session.' }
      }
      if (values.slotGameStopped && !values.allowEarlyWinRecord) {
        return { field: 'slotGameStopped', message: 'Start a new slot game after recording an early win.' }
      }
      const slotStages = getSlotPlayStages(values.gameName)
      if (values.slotStageResults.length !== slotStages.length) {
        return { field: 'slotStageResults', message: 'Record an outcome for each slot stake stage.' }
      }
      for (let index = 0; index < values.slotStageResults.length; index += 1) {
        const stageResult = values.slotStageResults[index]
        const stage = slotStages[index]
        if (stageResult.status === 'won') {
          const winInstance = Number(stageResult.winInstance)
          const wonAmount = Number(stageResult.wonAmount)
          if (!Number.isInteger(winInstance) || winInstance < 1 || winInstance > stage.plays) {
            return { field: 'slotStageResults', message: `Enter the winning instance from 1 to 10 for the ₹${stage.amounts[0]} stage.` }
          }
          if (stageResult.wonAmount === '' || !Number.isFinite(wonAmount) || wonAmount < 0) {
            return { field: 'slotStageResults', message: `Enter the won amount for the ₹${stage.amounts[0]} stage.` }
          }
          if (winInstance < stage.plays) {
            if (values.allowEarlyWinRecord) break
            return { field: 'slotGameStopped', message: 'A win before completing a 10-play stage requires starting a new slot game.' }
          }
        } else if (stageResult.status === 'lost') {
          const finalBalance = Number(stageResult.finalBalance)
          if (stageResult.finalBalance === '' || !Number.isFinite(finalBalance) || finalBalance < 0) {
            return { field: 'slotStageResults', message: `Enter the final balance for the ₹${stage.amounts[0]} stage.` }
          }
        } else {
          return { field: 'slotStageResults', message: `Choose won or lost for the ₹${stage.amounts[0]} stage.` }
        }
      }
      if (!values.slotRecordConfirmed) {
        return { field: 'slotStageResults', message: 'Select Add record to save the slot stage outcomes.' }
      }
    }

    if (values.gameType === 'roulette' || values.gameType === 'both') {
      const base = Number(values.rouletteBase)
      if (!Number.isFinite(base) || base <= 0 || base > SESSION_RULES.rouletteBaseMax) {
        return { field: 'rouletteBase', message: 'The roulette base amount must be greater than ₹0 and no more than ₹200.' }
      }
      if (values.gameType === 'roulette') {
        if (completedGames.some((game, index) => (
          index !== editingIndex && game.gameType === 'roulette' && game.gameName === values.gameName
        ))) {
          return { field: 'gameName', message: 'This roulette game has already been played in this session.' }
        }
        if (values.playedGames.length === 0) {
          return { field: 'playedGames', message: 'Record at least one roulette play before adding the game record.' }
        }
        for (let index = 0; index < values.playedGames.length; index += 1) {
          const play = values.playedGames[index]
          const amount = Number(play.amount)
          if (!Number.isFinite(amount) || amount <= 0 || !play.placed.trim() || !['won', 'lost'].includes(play.status)) {
            return { field: 'playedGames', message: `Complete the amount, placement, and outcome for roulette play ${index + 1}.` }
          }
        }
        const finalBalance = Number(values.rouletteFinalBalance)
        if (values.rouletteFinalBalance === '' || !Number.isFinite(finalBalance) || finalBalance < 0) {
          return { field: 'rouletteFinalBalance', message: 'Enter the final balance for the roulette game.' }
        }
        if (!values.rouletteRecordConfirmed) {
          return { field: 'playedGames', message: 'Select Add record to save the roulette game.' }
        }
      }
    }

  }

  return null
}

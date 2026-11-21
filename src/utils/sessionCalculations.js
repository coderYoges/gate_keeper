import { SLOT_PLAY_STAGES } from '../constants.js'
import { getSlotStageBalances } from './slotCalculations.js'

export function getSlotInvestment(stageResults) {
  return stageResults.reduce((total, result, index) => {
    const stage = SLOT_PLAY_STAGES[index]
    if (!stage) return total
    if (result.status === 'lost') return total + stage.plays * stage.amounts[0]
    if (result.status !== 'won') return total

    const instance = Number(result.winInstance)
    return Number.isInteger(instance) && instance > 0
      ? total + Math.min(instance, stage.plays) * stage.amounts[0]
      : total
  }, 0)
}

export function getRouletteInvestment(playedGames) {
  return playedGames.reduce((total, game) => {
    const amount = Number(game.amount)
    return Number.isFinite(amount) && amount > 0 ? total + amount : total
  }, 0)
}

export function getGameReturnedAmount(game) {
  if (game.gameType === 'slots') {
    const results = game.slotStageResults || []
    const balances = getSlotStageBalances(results, game.startingBalance)

    return results.reduce((total, result, index) => {
      if (result.status === 'won') {
        const wonAmount = Number(result.wonAmount)
        return result.wonAmount !== '' && Number.isFinite(wonAmount) && wonAmount > 0
          ? total + wonAmount
          : total
      }

      if (result.status !== 'lost') return total
      const balance = balances[index]
      const finalBalance = Number(result.finalBalance)
      if (
        result.finalBalance === ''
        || result.finalBalance === null
        || result.finalBalance === undefined
        || !Number.isFinite(finalBalance)
        || !Number.isFinite(balance?.startingBalance)
        || !Number.isFinite(balance?.entryAmount)
      ) return total

      return total + Math.max(0, finalBalance - balance.startingBalance + balance.entryAmount)
    }, 0)
  }

  if (
    game.gameType !== 'roulette'
    || game.finalBalance === ''
    || game.finalBalance === null
    || game.finalBalance === undefined
    || game.startingBalance === ''
    || game.startingBalance === null
    || game.startingBalance === undefined
  ) return 0

  const finalBalance = Number(game.finalBalance)
  const startingBalance = Number(game.startingBalance)
  if (!Number.isFinite(finalBalance) || !Number.isFinite(startingBalance)) return 0

  return Math.max(0, finalBalance - startingBalance + getRouletteInvestment(game.playedGames || []))
}

export function getTotalReturnedAmount(games) {
  return games.reduce((total, game) => total + getGameReturnedAmount(game), 0)
}

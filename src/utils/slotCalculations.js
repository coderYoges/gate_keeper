import { getSlotPlayStages } from '../constants.js'

export function getSlotStageBalances(stageResults, initialBalance, gameName) {
  let balance = initialBalance === '' || initialBalance === null || initialBalance === undefined
    ? null
    : Number(initialBalance)
  if (!Number.isFinite(balance)) balance = null

  return getSlotPlayStages(gameName).map((stage, index) => {
    const result = stageResults[index]
    const winInstance = Number(result?.winInstance)
    const playedCount = result?.status === 'won'
      ? (Number.isInteger(winInstance) && winInstance > 0 ? winInstance : null)
      : stage.plays
    const entryAmount = playedCount === null ? null : playedCount * stage.amounts[0]
    let finalBalance = null

    if (result?.status === 'won' && balance !== null && entryAmount !== null && result.wonAmount !== '') {
      const wonAmount = Number(result.wonAmount)
      if (Number.isFinite(wonAmount)) finalBalance = balance - entryAmount + wonAmount
    } else if (result?.status === 'lost' && result.finalBalance !== '') {
      const lossBalance = Number(result.finalBalance)
      if (Number.isFinite(lossBalance)) finalBalance = lossBalance
    }

    const earlyWin = result?.status === 'won' && playedCount !== null && playedCount < stage.plays
    const summary = { startingBalance: balance, entryAmount, finalBalance }
    balance = earlyWin ? null : finalBalance
    return summary
  })
}

export function getSlotGameFinalBalance(stageResults, startingBalance, gameName) {
  if (stageResults.length === 0) return null
  return getSlotStageBalances(stageResults, startingBalance, gameName)[stageResults.length - 1]?.finalBalance ?? null
}

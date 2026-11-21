export const PLAYER_IDS = ['PLAYER-001', 'PLAYER-002', 'PLAYER-003']

export const DAILY_SESSION_LIMITS = {
  weekday: 2,
  weekend: 4,
}

export const SESSION_RULES = {
  cooldownMs: 3 * 60 * 60 * 1000,
  depositMax: 15000,
  slotBetMax: 50,
  slotGamesMax: 3,
  rouletteBaseMax: 200,
  stopLossPercent: 0.5,
  stopWin: 1000,
}

export const STEP_LABELS = ['Readiness', 'Daily limits', 'Game plan', 'Review']

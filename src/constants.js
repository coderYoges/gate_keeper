export const DAILY_SESSION_LIMITS = {
  weekday: 2,
  weekend: 4,
}

export const SESSION_RULES = {
  depositMax: 15000,
  rouletteBaseMax: 200,
  stopLossPercent: 0.5,
  stopWin: 1000,
  weekdayCooldownHours: 3,
  weekendNightCooldownHours: 1,
  weekendNightStartHour: 18,
}

export const SLOT_STAKE_AMOUNTS_BY_GAME = {
  'Scarab Temple': [12.5, 25, 40, 50],
  '777 Burning wins': [10, 20, 25, 40, 50],
  'Inferno 777 Speed': [10, 15, 20, 25, 30, 35, 40, 50],
  'Diamond Jokers': [10, 15, 20, 25, 40, 50],
}

export function getSlotPlayStages(gameName) {
  const amounts = SLOT_STAKE_AMOUNTS_BY_GAME[gameName] || [10, 25, 40, 50]
  return amounts.map((amount) => ({ plays: 10, amounts: [amount] }))
}

export const MAX_SLOT_GAMES_PER_SESSION = 3

export const SLOT_GAME_NAMES = [
  'Scarab Temple',
  '777 Burning wins',
  'Diamond Jokers',
  'Inferno 777 Speed',
]

export const ROULETTE_GAME_NAMES = [
  'Mostbet Indian Roulette',
  'European Roulette',
  'RM European Roulette',
  'Mostbet Roulette',
  'Roulette VIP - Ring',
]

export const STEP_LABELS = ['Readiness', 'Daily limits', 'Game plan', 'Review']

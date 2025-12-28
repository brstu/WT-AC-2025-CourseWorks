export const RECIPE_DIFFICULTIES = [
  { value: 'easy', label: 'Лёгкая' },
  { value: 'medium', label: 'Средняя' },
  { value: 'hard', label: 'Сложная' },
] as const

export type RecipeDifficulty = (typeof RECIPE_DIFFICULTIES)[number]['value']

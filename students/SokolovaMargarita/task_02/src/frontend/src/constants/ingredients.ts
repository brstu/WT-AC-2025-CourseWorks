export const INGREDIENT_CATEGORIES = [
  { value: 'Dairy', label: 'Молочные продукты' },
  { value: 'Meat', label: 'Мясо' },
  { value: 'Fish', label: 'Рыба' },
  { value: 'Vegetables', label: 'Овощи' },
  { value: 'Fruits', label: 'Фрукты' },
  { value: 'Grains', label: 'Крупы' },
  { value: 'Legumes', label: 'Бобовые' },
  { value: 'Spices', label: 'Специи' },
  { value: 'Sauces', label: 'Соусы' },
  { value: 'Bakery', label: 'Выпечка' },
  { value: 'Drinks', label: 'Напитки' },
  { value: 'Sweets', label: 'Сладости' },
  { value: 'Other', label: 'Другое' },
] as const

export const INGREDIENT_UNITS = [
  { value: 'g', label: 'г' },
  { value: 'kg', label: 'кг' },
  { value: 'ml', label: 'мл' },
  { value: 'l', label: 'л' },
  { value: 'piece', label: 'шт' },
  { value: 'tbsp', label: 'ст. л.' },
  { value: 'tsp', label: 'ч. л.' },
  { value: 'cup', label: 'чашка' },
  { value: 'pinch', label: 'щепотка' },
] as const

export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number]['value']
export type IngredientUnit = (typeof INGREDIENT_UNITS)[number]['value']

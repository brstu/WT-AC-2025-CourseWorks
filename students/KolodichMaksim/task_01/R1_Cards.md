# R1 — Карточки и валидации (Forms & Models)

1. Регистрация / Вход
- email: string, required, must be valid email → ошибка: "Введите корректный email"
- password: string, required, min 6 символов → ошибка: "Введите пароль не короче 6 символов"

1. Metric (метрика)
- id: integer (autoincrement)
- name: string, required → ошибка: "Введите название метрики."
- unit: string, optional
- target_value: number, optional, >= 0 → ошибка: "Неверное значение цели"
- color: string, optional (HEX)
- user_id: integer, not editable in UI (назначается сервером)

1. Entry (запись)
- id: integer
- metric_id: integer, required → ошибка: "Выберите метрику"
- value: number, required → ошибка: "Введите значение"
- date: date, required (default: today) → ошибка: "Выберите дату"
- note: string, optional, max length 500

1. Goal
- id: integer
- metric_id: integer, required
- target_value: number, required
- period: string ∈ {daily, weekly, monthly} → ошибка: "Выберите период"
- start_date: date, required
- end_date: date, optional

UX notes:
- Формы должны показывать понятные inline-ошибки от сервера или клиентской валидации.
- Для `Entry.date` предусмотреть выбор и быстрые кнопки: Today, Yesterday.
- При регистрации пользователь получает набор дефолтных метрик — показать карточки сразу после регистрации.

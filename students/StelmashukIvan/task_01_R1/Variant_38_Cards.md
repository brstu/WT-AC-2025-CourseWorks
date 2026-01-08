# Вариант 38 — Карточки (обязательные поля и валидации)

1) Форма аутентификации
    - username: string, только алфавит, не пустое → ошибка: «Введите корректное имя пользователя (только буквы).»
    - password: string, не пустое → ошибка: «Введите пароль.»

2) Карточка устройства (Device)

    - id: UUID, автогенерируется
    - name: string, не пустое → ошибка: «Введите название устройства.»
    - description: string, опционально
    - location: string, опционально
    - owner_id: reference -> User.id, не пустое → ошибка: «Выберите владельца.»

3) Карточка метрики (Metric)

    - id: UUID
    - device_id: reference -> Device.id, не пустое → ошибка: «Выберите устройство.»
    - name: string, не пустое → ошибка: «Введите название метрики (например: Температура).»
    - unit: string, не пустое → ошибка: «Введите единицы измерения (например: °C).»

4) Карточка значения (Reading)

    - id: UUID
    - metric_id: reference -> Metric.id, не пустое → ошибка: «Выберите метрику.»
    - timestamp: datetime, не пустое → ошибка: «Выберите дату и время.»
    - value: number, не пустое → ошибка: «Неверный формат значения.»

5) Карточка алерта (Alert)

    - id: UUID
    - metric_id: reference -> Metric.id, не пустое
    - reading_id: reference -> Reading.id, опционально
    - level: enum [info, warning, critical], не пустое → ошибка: «Укажите уровень алерта.»
    - threshold: number, опционально
    - message: string, не пустое → ошибка: «Сообщение алерта не может быть пустым.»
    - status: enum [new, acknowledged, closed], default: new
    - created_at: datetime

6) Карточка заявки (если используется)

    - type: enum [add, edit, delete], не пустое
    - object: enum [user, device, metric], не пустое
    - comment: string, max 5000

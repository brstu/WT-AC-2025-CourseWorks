# Вариант 17 — Доставка «Где моя посылка?» — Карточки (обязательные поля и валидации)

1) Форма аутентификации (User)

- email: string, не пустое → ошибка: «All fields must be filled in!»
- password: string, не пустое, min 6 → ошибка: «Password must be more than 6 characters long!»
- firstname: string, обязателен для signup → ошибка: «All fields must be filled in!»

1) Карточка пользователя (User)

- _id: ObjectId, автогенерируется
- email: string, уникальный, не пустое → ошибка: «This user already exists!» / «A user with this email already exists»
- password: string (hash), не пустое, min 6 → ошибка: «Password must be more than 6 characters long!»
- firstname: string | null → для signup обязателен
- lastname: string | null, опционально
- phone: string | null, опционально → ошибка при коллизии: «A user with this phone number already exists»
- role: enum ['user','admin'], default 'user' → ошибка: «Invalid user role!»

1) Карточка страны (Country)

- _id: ObjectId
- name: string, не пустое → ошибка: «All fields must be filled in!»
- countryCode: string, 2–3 латинские буквы, uppercase, уникально → ошибка: «Invalid country code!» / «Country with this code already exists!»

1) Карточка города (City)

- _id: ObjectId
- name: string, не пустое → ошибка: «All fields must be filled in!»
- cityCode: string, uppercase, уникально → ошибка: «City with this code already exists!»
- countryId: reference -> Country._id, не пустое → ошибка: «All fields must be filled in!»

1) Карточка адреса/узла логистики (Address/Location)

В проекте «адрес» представлен сущностью Location (склады/ПВЗ/сорт-центры и т.п.).

- _id: ObjectId
- type: number enum
  - 0 warehouse
  - 1 sort_center
  - 2 pickup_point
  - 3 locker
  - 4 hub
- label: string, не пустое → ошибка: «All fields must be filled in!: label»
- locationCode: string, не пустое, уникально → ошибка: «Location with this code already exists!»
- cityId: reference -> City._id, не пустое → ошибка: «All fields must be filled in!: cityId»
- postalCode: string, не пустое → ошибка: «All fields must be filled in!: postalCode»
- street: string, не пустое → ошибка: «All fields must be filled in!: street»

1) Карточка заказа (Order)

- _id: ObjectId
- name: string, не пустое → ошибка: «All fields must be filled in!: name»
- userId: reference -> User._id, не пустое → ошибка: «All fields must be filled in!: userId»
- orderCode: string, автогенерация вида `ORD-XXXXXXXX`, уникально → ошибка: «Failed to generate a unique order code»
- status: number (Order Status, OS)
  - 0 created
  - 1 shipped
  - 2 delivered
  - 3 at_pickup_point
  - 5 returned
- pickupLocation: reference -> Location._id, не пустое
- currentLocation: reference -> Location._id, не пустое

1) Карточка события трекинга (TrackingEvent / Event)

- _id: ObjectId
- orderId: reference -> Order._id, не пустое → ошибка: «All fields must be filled in!: orderId»
- location: reference -> Location._id, не пустое → ошибка: «All fields must be filled in!: location»
- status: number (Event Status, ES)
  - 0 created
  - 1 shipped
  - 2 in_transit
  - 3 out_for_delivery
  - 4 delivered
  - 5 at_pickup_point
  - 6 returned
- description: string, опционально (default '')

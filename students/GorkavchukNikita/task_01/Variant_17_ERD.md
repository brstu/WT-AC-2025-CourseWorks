# Вариант 17 — ERD (диаграмма сущностей) — Доставка «Где моя посылка?»

Файл содержит: 1) mermaid-диаграмму ERD; 2) ASCII-эскиз; 3) минимальный SQL DDL-скетч (пример) для понимания связей.

## Mermaid ERD

```mermaid
erDiagram
    USER ||--o{ ORDER : owns
    ORDER ||--o{ EVENT : has

    COUNTRY ||--o{ CITY : contains
    CITY ||--o{ LOCATION : contains

    LOCATION ||--o{ ORDER : pickupLocation
    LOCATION ||--o{ ORDER : currentLocation
    LOCATION ||--o{ EVENT : eventLocation

    USER {
      id ObjectId PK
      email string UNIQUE
      password_hash string
      firstname string
      lastname string
      phone string
      role string
    }

    COUNTRY {
      id ObjectId PK
      countryCode string UNIQUE
      name string
    }

    CITY {
      id ObjectId PK
      cityCode string UNIQUE
      name string
      countryId ObjectId FK
    }

    LOCATION {
      id ObjectId PK
      type int
      label string
      locationCode string UNIQUE
      cityId ObjectId FK
      postalCode string
      street string
    }

    ORDER {
      id ObjectId PK
      name string
      userId ObjectId
      orderCode string UNIQUE
      status int
      pickupLocation ObjectId FK
      currentLocation ObjectId FK
    }

    EVENT {
      id ObjectId PK
      orderId ObjectId FK
      location ObjectId FK
      status int
      description string
    }
```

## ASCII-эскиз

```
User 1---* Order 1---* Event
             |             \
             |              *--- Location (event.location)
             |
             *--- Location (pickupLocation)
             *--- Location (currentLocation)

Country 1---* City 1---* Location
```

## Минимальный SQL DDL (пример, PostgreSQL)

> В проекте фактически используется MongoDB (Mongoose), но для отчёта удобно показать связи в виде SQL-скетча.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  firstname TEXT,
  lastname TEXT,
  phone TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('user','admin'))
);

CREATE TABLE countries (
  id UUID PRIMARY KEY,
  country_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE cities (
  id UUID PRIMARY KEY,
  city_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country_id UUID NOT NULL REFERENCES countries(id)
);

CREATE TABLE locations (
  id UUID PRIMARY KEY,
  type INT NOT NULL,
  label TEXT NOT NULL,
  location_code TEXT UNIQUE NOT NULL,
  city_id UUID NOT NULL REFERENCES cities(id),
  postal_code TEXT NOT NULL,
  street TEXT NOT NULL
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  order_code TEXT UNIQUE NOT NULL,
  status INT NOT NULL,
  pickup_location UUID NOT NULL REFERENCES locations(id),
  current_location UUID NOT NULL REFERENCES locations(id)
);

CREATE TABLE events (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id),
  status INT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

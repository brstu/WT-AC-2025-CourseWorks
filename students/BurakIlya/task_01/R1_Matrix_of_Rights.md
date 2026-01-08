# Вариант 43 — Матрица прав (операция × роль)

## Роли системы

- **admin** — администратор системы
- **user** — обычный пользователь

**Волонтёр** = user с созданным VolunteerProfile.

## Таблица прав

| Операция | Admin | User | User + VolunteerProfile |
|----------|-------|------|-------------------------|
| Просмотр всех запросов помощи | ✅ | ❌ (только свои) | ✅ (все со status=new) |
| Создать HelpRequest | ✅ | ✅ | ✅ |
| Редактировать HelpRequest | ✅ | ✅ (свой) | ✅ (свой) |
| Удалить HelpRequest | ✅ | ✅ (свой, status=new) | ✅ (свой, status=new) |
| Просмотр профилей волонтёров | ✅ | ✅ | ✅ |
| Создать VolunteerProfile | ✅ | ✅ (себе) | — (уже есть) |
| Редактировать VolunteerProfile | ✅ | — | ✅ (свой) |
| Удалить VolunteerProfile | ✅ | — | ✅ (свой) |
| Отклик на запрос (Assignment) | ✅ | ❌ | ✅ (если request.status=new) |
| Назначение волонтёра | ✅ | ❌ | ❌ |
| Изменение статуса Assignment | ✅ | ❌ | ✅ (свой) |
| Создать/Редактировать/Удалить Category | ✅ | ❌ | ❌ |
| Создать Review | ✅ | ✅ (свой completed) | ✅ (свой completed) |
| Редактировать/Удалить Review | ✅ | ✅ (свой) | ✅ (свой) |
| Управление пользователями | ✅ | ❌ | ❌ |
| Просмотр статистики | ✅ (вся) | ❌ | ✅ (своя) |

## Проверки безопасности (обязательные)

1. **Удаление HelpRequest**: разрешено только если `status = 'new'`.
2. **Создание Assignment**: проверить `request.status = 'new'` и наличие VolunteerProfile у user.
3. **Создание Review**: проверить `assignment.status = 'completed'` и `assignment.request.user_id = currentUser.id`.
4. **Изменение Assignment**: проверить `assignment.volunteer_id = currentUser.id` или role = admin.
5. **Доступ к чужим ресурсам**: всегда проверять ownership или role = admin.

## Примечания

- По умолчанию user видит только свои запросы помощи.
- User с VolunteerProfile видит все активные запросы помощи в системе (status=new).
- Волонтёр не может откликнуться на свой собственный запрос.

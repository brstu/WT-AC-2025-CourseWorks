# Books (Variant 19)

Simple books app (MVP) implemented in Go with Gin, PostgreSQL, Bootstrap.

Features:

- Users (register/login) with JWT auth
- Books CRUD
- Shelves (per user)
- Reviews & ratings
- 3-layer architecture: repository, service, handler
- OpenAPI (docs/openapi.yaml)

Run (with Docker):

1) docker-compose up --build
2) Open <http://localhost:8080>

API:

- POST /api/register - {email,password,name}
- POST /api/login - {email,password}
- GET /api/books
- POST /api/books (auth)
- GET /api/books/:id
- PUT /api/books/:id (auth)
- DELETE /api/books/:id (auth)

Notes:

- JWT: set `JWT_SECRET` in environment or `.env` (see `.env.example`).
- DB migrations are in `migrations/` and will be applied on server start if accessible.
- OpenAPI / Swagger file is available at `docs/openapi.yaml`.

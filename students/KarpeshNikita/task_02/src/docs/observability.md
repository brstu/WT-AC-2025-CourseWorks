# Observability

This project now exposes a Prometheus metrics endpoint and basic metrics instrumentation.

- Metrics endpoint: `GET /metrics` (Prometheus format)
- Recorded metrics:
  - `booksapp_http_requests_total{method, path, status}` - counter of HTTP requests
  - `booksapp_http_request_duration_seconds{method, path, status}` - histogram of request durations

To scrape metrics with Prometheus, add a job targeting the application host and port (default 8080) and path `/metrics`.

---

CI changes

- Added `golangci-lint` step to run linter in CI.
- Added a `docker-build` job to build the project Docker image in CI (no push by default).

import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from "prom-client";

export const register = new Registry();
collectDefaultMetrics({ register });

export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "path", "status"],
  registers: [register]
});

export const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "path", "status"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register]
});

export const activeUsersGauge = new Gauge({
  name: "active_users_total",
  help: "Number of active users",
  registers: [register]
});

export const authAttemptsTotal = new Counter({
  name: "auth_attempts_total",
  help: "Total authentication attempts",
  labelNames: ["type", "success"],
  registers: [register]
});


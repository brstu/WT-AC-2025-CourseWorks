export const INCIDENT_STATUSES = ["open", "in_progress", "escalated", "resolved"] as const;

export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export const INCIDENT_PRIORITIES = ["low", "medium", "high", "critical"] as const;

export type IncidentPriority = (typeof INCIDENT_PRIORITIES)[number];

function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isIncidentStatus(value: unknown): value is IncidentStatus {
  return isString(value) && (INCIDENT_STATUSES as readonly string[]).includes(value);
}

export function isIncidentPriority(value: unknown): value is IncidentPriority {
  return isString(value) && (INCIDENT_PRIORITIES as readonly string[]).includes(value);
}

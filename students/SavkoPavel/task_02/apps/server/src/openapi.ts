// Minimal OpenAPI 3.0 spec for Variant 26 MVP.
// Kept as a plain object (no build-time JSON import needed).

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Incident Management System API",
    version: "0.1.0",
    description: "Variant 26 — Incidents: incidents, queues, SLA, comments. JWT auth + roles.",
  },
  servers: [{ url: "http://localhost:3000" }],
  tags: [
    { name: "Auth" },
    { name: "Users" },
    { name: "Queues" },
    { name: "SLA" },
    { name: "Incidents" },
    { name: "Comments" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ApiOk: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["ok"] },
          data: {},
        },
        required: ["status", "data"],
      },
      ApiError: {
        type: "object",
        properties: {
          error: { oneOf: [{ type: "string" }, { type: "object" }] },
          message: { type: "string" },
        },
      },
      Role: { type: "string", enum: ["ADMIN", "AGENT", "USER"] },
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string", format: "email" },
          role: { $ref: "#/components/schemas/Role" },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["id", "email", "role"],
      },
      Queue: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          sla: {
            anyOf: [{ $ref: "#/components/schemas/SLA" }, { type: "null" }],
          },
        },
        required: ["id", "name", "createdAt"],
      },
      SLA: {
        type: "object",
        properties: {
          id: { type: "string" },
          queueId: { type: "string" },
          reactionTimeMinutes: { type: "integer" },
          resolutionTimeMinutes: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
          queue: { $ref: "#/components/schemas/Queue" },
        },
        required: ["id", "queueId", "reactionTimeMinutes", "resolutionTimeMinutes"],
      },
      IncidentStatus: { type: "string", enum: ["open", "in_progress", "escalated", "resolved"] },
      IncidentPriority: { type: "string", enum: ["low", "medium", "high", "critical"] },
      Incident: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          status: { $ref: "#/components/schemas/IncidentStatus" },
          priority: { $ref: "#/components/schemas/IncidentPriority" },
          queueId: { type: "string" },
          slaId: { type: "string" },
          createdById: { type: "string" },
          assignedToId: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "title", "description", "status", "priority", "queueId", "slaId", "createdById"],
      },
      Comment: {
        type: "object",
        properties: {
          id: { type: "string" },
          incidentId: { type: "string" },
          message: { type: "string" },
          authorId: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["id", "incidentId", "message", "authorId"],
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/health": {
      get: {
        tags: ["Auth"],
        summary: "Healthcheck",
        security: [],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { status: { type: "string" } },
                },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { allOf: [{ $ref: "#/components/schemas/ApiOk" }], properties: { data: { $ref: "#/components/schemas/User" } } },
              },
            },
          },
          "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "409": { description: "User exists", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [{ $ref: "#/components/schemas/ApiOk" }],
                  properties: {
                    data: {
                      type: "object",
                      properties: { token: { type: "string" } },
                      required: ["token"],
                    },
                  },
                },
              },
            },
          },
          "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "401": { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },
    "/users/me": {
      get: {
        tags: ["Users"],
        summary: "Current user payload",
        responses: {
          "200": { description: "OK" },
        },
      },
    },
    "/users": {
      get: {
        tags: ["Users"],
        summary: "List users (ADMIN)",
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/ApiOk" }], properties: { data: { type: "array", items: { $ref: "#/components/schemas/User" } } } } } },
          },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Create user (ADMIN)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                  role: { $ref: "#/components/schemas/Role" },
                },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: { "201": { description: "Created" } },
      },
    },
    "/queues": {
      get: {
        tags: ["Queues"],
        summary: "List queues",
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/ApiOk" }], properties: { data: { type: "array", items: { $ref: "#/components/schemas/Queue" } } } } } },
          },
        },
      },
      post: {
        tags: ["Queues"],
        summary: "Create queue (ADMIN)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, description: { type: "string" } }, required: ["name"] } } },
        },
        responses: { "201": { description: "Created" } },
      },
    },
    "/sla": {
      get: {
        tags: ["SLA"],
        summary: "List SLA",
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/ApiOk" }], properties: { data: { type: "array", items: { $ref: "#/components/schemas/SLA" } } } } } },
          },
        },
      },
      post: {
        tags: ["SLA"],
        summary: "Create SLA (ADMIN)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  queueId: { type: "string" },
                  reactionTimeMinutes: { type: "integer", minimum: 1 },
                  resolutionTimeMinutes: { type: "integer", minimum: 1 },
                },
                required: ["queueId", "reactionTimeMinutes", "resolutionTimeMinutes"],
              },
            },
          },
        },
        responses: { "201": { description: "Created" } },
      },
    },
    "/incidents": {
      get: {
        tags: ["Incidents"],
        summary: "List incidents",
        parameters: [
          { name: "status", in: "query", schema: { $ref: "#/components/schemas/IncidentStatus" } },
          { name: "priority", in: "query", schema: { $ref: "#/components/schemas/IncidentPriority" } },
          { name: "queueId", in: "query", schema: { type: "string" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
          { name: "offset", in: "query", schema: { type: "integer" } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/ApiOk" }], properties: { data: { type: "array", items: { $ref: "#/components/schemas/Incident" } } } } } },
          },
        },
      },
      post: {
        tags: ["Incidents"],
        summary: "Create incident (ADMIN/USER)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { $ref: "#/components/schemas/IncidentPriority" },
                  queueId: { type: "string" },
                },
                required: ["title", "description"],
              },
            },
          },
        },
        responses: { "201": { description: "Created" } },
      },
    },
    "/incidents/{id}/comments": {
      get: {
        tags: ["Comments"],
        summary: "List comments",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/ApiOk" }], properties: { data: { type: "array", items: { $ref: "#/components/schemas/Comment" } } } } } },
          },
        },
      },
      post: {
        tags: ["Comments"],
        summary: "Add comment",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", properties: { message: { type: "string" } }, required: ["message"] },
            },
          },
        },
        responses: { "201": { description: "Created" } },
      },
    },
  },
} as const;

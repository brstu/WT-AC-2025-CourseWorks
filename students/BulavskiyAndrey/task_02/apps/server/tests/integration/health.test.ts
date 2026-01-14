import request from "supertest";
import { createTestApp } from "./setup.js";
import "./setup.js";

const app = createTestApp();

describe("health endpoints", () => {
  it("returns health status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.timestamp).toBeTruthy();
  });

  it("returns readiness status", async () => {
    const res = await request(app).get("/api/ready");
    expect([200, 503]).toContain(res.status);
    expect(res.body.status).toBeTruthy();
    expect(res.body.checks).toBeTruthy();
  });
});


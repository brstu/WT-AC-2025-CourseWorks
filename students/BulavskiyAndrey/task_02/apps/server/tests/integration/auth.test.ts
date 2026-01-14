import request from "supertest";
import { createTestApp } from "./setup.js";
import "./setup.js";

const app = createTestApp();

const extractRefreshCookie = (res: request.Response) => {
  const cookies = res.get("set-cookie") || [];
  return cookies.find((c) => c.startsWith("refresh_token="));
};

describe("auth flow", () => {
  it("registers a new user and returns tokens", async () => {
    const uniqueEmail = `new-${Date.now()}@test.local`;
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: uniqueEmail, name: "New User", password: "Secret123!" });

    expect(res.status).toBe(201);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(extractRefreshCookie(res)).toBeTruthy();
  });

  it("rejects registration with existing email", async () => {
    const uniqueEmail = `existing-${Date.now()}@test.local`;
    await request(app)
      .post("/api/auth/register")
      .send({ email: uniqueEmail, name: "User 1", password: "Secret123!" });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: uniqueEmail, name: "User 2", password: "Secret123!" });

    expect(res.status).toBe(409);
  });

  it("rejects invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nonexistent@test.local", password: "wrong" });

    expect(res.status).toBe(401);
  });
});


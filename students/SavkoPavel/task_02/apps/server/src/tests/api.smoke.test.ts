import request from "supertest";
import { app } from "../app";
import { prisma } from "../lib/prisma";

describe("API smoke (Variant 26)", () => {
  it("register -> login -> /users/me", async () => {
    const email = "admin@test.local";
    const password = "password123";

    const reg = await request(app).post("/auth/register").send({ email, password });
    expect(reg.status).toBe(201);
    expect(reg.body?.data?.email).toBe(email);

    const login = await request(app).post("/auth/login").send({ email, password });
    expect(login.status).toBe(200);
    expect(typeof login.body?.data?.token).toBe("string");

    const token = login.body.data.token;

    const me = await request(app).get("/users/me").set("Authorization", `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body?.data?.userId).toBeDefined();
  });

  it("admin can create queue + SLA + incident and add comment", async () => {
    // Create first user => ADMIN
    const email = "admin2@test.local";
    const password = "password123";

    await request(app).post("/auth/register").send({ email, password }).expect(201);
    const login = await request(app).post("/auth/login").send({ email, password }).expect(200);
    const token = login.body.data.token as string;

    // Create queue (ADMIN)
    const q = await request(app)
      .post("/queues")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Support", description: "Support queue" });
    expect(q.status).toBe(201);
    const queueId = q.body.data.id as string;

    // Create SLA
    const sla = await request(app)
      .post("/sla")
      .set("Authorization", `Bearer ${token}`)
      .send({ queueId, reactionTimeMinutes: 1, resolutionTimeMinutes: 2 });
    expect(sla.status).toBe(201);

    // Create incident
    const inc = await request(app)
      .post("/incidents")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Printer broken", description: "It is on fire", queueId });
    expect(inc.status).toBe(201);
    const incidentId = inc.body.data.id as string;

    // Add comment
    const c = await request(app)
      .post(`/incidents/${incidentId}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "We are investigating" });
    expect(c.status).toBe(201);

    const list = await request(app)
      .get(`/incidents/${incidentId}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(list.body.data)).toBe(true);
    expect(list.body.data.length).toBe(1);

    // sanity: DB has the rows
    const dbIncident = await prisma.incident.findUnique({ where: { id: incidentId } });
    expect(dbIncident?.queueId).toBe(queueId);
  });

  it("agent cannot create incident", async () => {
    // First user ADMIN
    await request(app).post("/auth/register").send({ email: "admin3@test.local", password: "password123" }).expect(201);
    const loginAdmin = await request(app)
      .post("/auth/login")
      .send({ email: "admin3@test.local", password: "password123" })
      .expect(200);
    const adminToken = loginAdmin.body.data.token as string;

    // Create agent via admin
    const agent = await request(app)
      .post("/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: "agent@test.local", password: "password123", role: "AGENT" });
    expect(agent.status).toBe(201);

    // Login agent
    const loginAgent = await request(app)
      .post("/auth/login")
      .send({ email: "agent@test.local", password: "password123" })
      .expect(200);
    const agentToken = loginAgent.body.data.token as string;

    const res = await request(app)
      .post("/incidents")
      .set("Authorization", `Bearer ${agentToken}`)
      .send({ title: "X", description: "Y" });

    expect(res.status).toBe(403);
  });
});

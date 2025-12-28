import request from 'supertest';
import { app } from '../../index';
import { prisma } from '../../prisma';

describe('Issues API Integration', () => {
  let authToken;
  let testUser;
  let testProject;

  beforeAll(async () => {
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedPassword',
        name: 'Test User',
      },
    });

    testProject = await prisma.project.create({
      data: {
        name: 'Test Project',
        creatorId: testUser.id,
      },
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    await prisma.issue.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('GET /api/issues', () => {
    it('should return list of issues', async () => {
      const response = await request(app)
        .get('/api/issues')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('issues');
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('POST /api/issues', () => {
    it('should create a new issue', async () => {
      const newIssue = {
        title: 'Test Issue',
        description: 'Test Description',
        projectId: testProject.id,
        status: 'TODO',
        priority: 'MEDIUM',
      };

      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newIssue);

      expect(response.status).toBe(201);
      expect(response.body.issue).toHaveProperty('id');
      expect(response.body.issue.title).toBe(newIssue.title);
    });
  });
});
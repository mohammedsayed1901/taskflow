import type { Express } from 'express';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const TEST_DATABASE_NAME = 'taskflow_test';
const TEST_PASSWORD = 'SecurePass1';

type TestAgent = ReturnType<typeof request.agent>;

let app: Express;
let disconnectDatabase: () => Promise<void>;

async function clearTestData(): Promise<void> {
  if (mongoose.connection.name !== TEST_DATABASE_NAME) {
    throw new Error(`Refusing to clean unexpected database: ${mongoose.connection.name}`);
  }

  const [{ TaskModel }, { UserModel }] = await Promise.all([
    import('../src/models/task.model.js'),
    import('../src/models/user.model.js'),
  ]);

  await Promise.all([TaskModel.deleteMany({}), UserModel.deleteMany({})]);
}

async function registerUser(agent: TestAgent, email: string): Promise<void> {
  const response = await agent
    .post('/api/auth/register')
    .send({
      name: 'Test User',
      email,
      password: TEST_PASSWORD,
    })
    .expect(201);

  const setCookieHeader: unknown = response.headers['set-cookie'];

  const serializedCookies = Array.isArray(setCookieHeader)
    ? setCookieHeader.join(';')
    : String(setCookieHeader ?? '');

  expect(serializedCookies).toContain('HttpOnly');
}

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.PORT = '5001';
  process.env.MONGODB_URI = `mongodb://127.0.0.1:27017/${TEST_DATABASE_NAME}`;
  process.env.CLIENT_ORIGIN = 'http://localhost:5173';
  process.env.JWT_SECRET = 'test-only-jwt-secret-with-at-least-32-characters';
  process.env.JWT_EXPIRES_IN_SECONDS = '3600';
  process.env.BCRYPT_SALT_ROUNDS = '10';

  const appModule = await import('../src/app.js');
  const databaseModule = await import('../src/config/database.js');

  app = appModule.app;
  disconnectDatabase = databaseModule.disconnectDatabase;

  await databaseModule.connectDatabase();
}, 10_000);

beforeEach(async () => {
  await clearTestData();
});

afterAll(async () => {
  await clearTestData();
  await disconnectDatabase();
});

describe('TaskFlow API', () => {
  it('supports the complete authentication lifecycle', async () => {
    const agent = request.agent(app);
    const email = 'auth@example.com';

    await registerUser(agent, email);

    const currentUser = await agent.get('/api/auth/me').expect(200);

    expect(currentUser.body.data.user).toMatchObject({
      name: 'Test User',
      email,
    });

    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate User',
        email,
        password: TEST_PASSWORD,
      })
      .expect(409);

    await agent.post('/api/auth/logout').expect(204);

    await agent.get('/api/auth/me').expect(401);

    await agent
      .post('/api/auth/login')
      .send({
        email,
        password: TEST_PASSWORD,
      })
      .expect(200);

    await agent.get('/api/auth/me').expect(200);
  });

  it('creates, searches, filters, updates, and deletes tasks', async () => {
    const owner = request.agent(app);

    await registerUser(owner, 'owner@example.com');

    const firstTask = await owner
      .post('/api/tasks')
      .send({
        title: 'Prepare review',
        description: 'Demonstrate the API',
        status: 'todo',
        priority: 'high',
        dueDate: '2026-08-31',
      })
      .expect(201);

    await owner
      .post('/api/tasks')
      .send({
        title: 'Buy groceries',
        description: 'Prepare the shopping list',
        status: 'done',
        priority: 'low',
        dueDate: '2026-09-02',
      })
      .expect(201);

    expect(firstTask.body.data.task.dueDate).toBe('2026-08-31T00:00:00.000Z');

    const filtered = await owner
      .get('/api/tasks')
      .query({
        search: 'REVIEW',
        status: 'todo',
        priority: 'high',
        page: '1',
        limit: '12',
        sort: 'dueDate',
      })
      .expect(200);

    expect(filtered.body.data.tasks).toHaveLength(1);
    expect(filtered.body.data.tasks[0].title).toBe('Prepare review');
    expect(filtered.body.data.pagination).toEqual({
      page: 1,
      limit: 12,
      total: 1,
      pages: 1,
    });

    const taskId = firstTask.body.data.task.id;

    const updated = await owner
      .patch(`/api/tasks/${taskId}`)
      .send({
        status: 'in-progress',
        priority: 'medium',
      })
      .expect(200);

    expect(updated.body.data.task).toMatchObject({
      id: taskId,
      status: 'in-progress',
      priority: 'medium',
    });

    await owner.delete(`/api/tasks/${taskId}`).expect(204);

    const remaining = await owner.get('/api/tasks').expect(200);

    expect(remaining.body.data.tasks.some((task: { id: string }) => task.id === taskId)).toBe(
      false
    );
  });

  it('rejects unauthenticated and invalid requests', async () => {
    await request(app).get('/api/tasks').expect(401);

    const owner = request.agent(app);

    await registerUser(owner, 'validation@example.com');

    const invalidTask = await owner
      .post('/api/tasks')
      .send({
        title: '',
        description: 'Invalid task',
        status: 'todo',
        priority: 'high',
        dueDate: '2026-02-30',
        owner: '507f1f77bcf86cd799439011',
      })
      .expect(400);

    const invalidFields: string[] = invalidTask.body.details.map(
      (detail: { field: string }) => detail.field
    );

    expect(invalidFields).toContain('title');
    expect(invalidFields).toContain('dueDate');
    expect(invalidFields).toContain('owner');

    await owner.delete('/api/tasks/not-an-object-id').expect(400);

    await owner.patch('/api/tasks/507f1f77bcf86cd799439011').send({}).expect(400);
  });

  it("prevents users from accessing each other's tasks", async () => {
    const owner = request.agent(app);
    const secondUser = request.agent(app);

    await registerUser(owner, 'first-owner@example.com');

    await registerUser(secondUser, 'second-owner@example.com');

    const created = await owner
      .post('/api/tasks')
      .send({
        title: 'Private owner task',
        description: 'Only the owner may access this',
        status: 'todo',
        priority: 'high',
        dueDate: '2026-09-05',
      })
      .expect(201);

    const taskId = created.body.data.task.id;

    const secondUserList = await secondUser.get('/api/tasks').expect(200);

    expect(secondUserList.body.data.tasks).toEqual([]);
    expect(secondUserList.body.data.pagination.total).toBe(0);

    await secondUser
      .patch(`/api/tasks/${taskId}`)
      .send({
        status: 'done',
      })
      .expect(404);

    await secondUser.delete(`/api/tasks/${taskId}`).expect(404);

    const ownerList = await owner.get('/api/tasks').expect(200);

    expect(ownerList.body.data.tasks).toHaveLength(1);
    expect(ownerList.body.data.tasks[0].id).toBe(taskId);
    expect(ownerList.body.data.tasks[0].status).toBe('todo');
  });
});

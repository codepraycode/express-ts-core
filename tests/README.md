# Tests

This directory contains integration and unit tests for the API.

## Setup

Create a `.env.test` file at the project root (copy from `.env.example`) and point `DATABASE_URL` at a separate test database:

```
DATABASE_URL=postgresql://root:password@localhost:5432/app_db_test
NODE_ENV=test
```

> **Never point the test database at your development or production database.**

## Running Tests

```bash
pnpm test           # run all tests once
pnpm test --watch   # watch mode (re-run on change)
```

## Structure

```
tests/
├── fixtures/
│   └── index.ts     # clearDatabase / seedModel helpers
├── setup.ts          # Jest global setup / teardown (Prisma + Redis teardown)
└── <feature>/
    └── *.test.ts     # Feature-specific tests
```

## Writing Tests

Each test file should import `createApp` from `src/app.ts` and use **Supertest** to make HTTP requests:

```typescript
import request from "supertest";
import { createApp } from "../../src/app";
import { clearDatabase } from "../fixtures";

const app = createApp();

beforeEach(() => clearDatabase());

it("POST /api/v1/auth/register creates a user", async () => {
  const res = await request(app)
    .post("/api/v1/auth/register")
    .send({ name: "Alice", email: "alice@test.com", password: "Password123!" });

  expect(res.status).toBe(201);
  expect(res.body.data.user.email).toBe("alice@test.com");
});
```

# Express TypeScript API Template

> A production-ready, feature-based REST API template for Node.js. Clone once, build forever.

[![CI](https://github.com/codepraycode/express-ts-core/actions/workflows/ci.yml/badge.svg)](https://github.com/codepraycode/express-ts-core/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ What's Included

| Layer | Technology |
|---|---|
| HTTP Server | [Express 4](https://expressjs.com/) |
| Language | TypeScript 5 (strict mode) |
| ORM | [Prisma 5](https://www.prisma.io/) |
| Database | PostgreSQL 16 |
| Caching / Sessions | Redis 7 |
| Authentication | JWT (jsonwebtoken) + bcrypt |
| Email | Nodemailer (SMTP) |
| Real-time | Socket.IO |
| Logging | Winston + daily log rotation |
| Testing | Jest + Supertest |
| Linting | ESLint 9 (flat config) + Prettier |
| Containerisation | Docker Compose |
| CI | GitHub Actions |

---

## 📁 Project Structure

```
.
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # Lint → Typecheck → Test → Build
│   │   └── release.yml         # Auto-release on semver tags
│   └── PULL_REQUEST_TEMPLATE.md
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Default seed (admin user)
├── src/
│   ├── app.ts                  # Express app factory
│   ├── server.ts               # HTTP server + graceful shutdown
│   ├── core/                   # Infrastructure (no business logic)
│   │   ├── database/
│   │   │   └── prisma.ts       # Singleton Prisma client
│   │   ├── services/
│   │   │   ├── email.service.ts
│   │   │   ├── redis.service.ts
│   │   │   └── socket.service.ts
│   │   └── utils/
│   │       ├── api-response.ts
│   │       ├── custom-errors.ts  # BaseError + HTTP error subclasses
│   │       ├── generator.ts
│   │       ├── http-status-codes.ts
│   │       └── logger.ts
│   ├── config/
│   │   ├── env.config.ts       # Typed envConfig object (single source of truth)
│   │   ├── security.config.ts  # CORS + rate limiters
│   │   └── session.config.ts   # Redis session store
│   ├── middlewares/            # Global Express pipes only
│   │   ├── core.middleware.ts  # CORS, body parser, cookie parser
│   │   ├── error.middleware.ts # Centralised error handler
│   │   ├── logger.middleware.ts
│   │   └── morgan.middleware.ts
│   ├── features/               # Self-contained feature modules
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.middleware.ts  # authenticate + authorize guards
│   │   │   ├── auth.repository.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.types.ts
│   │   │   ├── auth.utils.ts       # JWT, bcrypt, HMAC helpers
│   │   │   └── index.ts            # Barrel export (the Gatekeeper)
│   │   └── user/
│   │       ├── user.controller.ts
│   │       ├── user.repository.ts
│   │       ├── user.routes.ts
│   │       ├── user.service.ts
│   │       ├── user.types.ts
│   │       └── index.ts            # Barrel export
│   └── types/
│       ├── express.d.ts            # req.user type augmentation
│       └── express-session.d.ts    # Session type augmentation
└── tests/
    ├── fixtures/
    │   └── index.ts            # clearDatabase / seedModel helpers
    └── setup.ts                # Jest global setup/teardown
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 18 |
| pnpm | ≥ 10 |
| Docker | any recent version |
| Docker Compose | v2+ |

### 1. Use this template

Click **"Use this template"** on GitHub, or clone directly:

```bash
git clone https://github.com/codepraycode/express-ts-core.git my-api
cd my-api
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Then edit `.env`. At minimum, set:

```dotenv
JWT_SECRET=<64-char random hex>
SESSION_SECRET=<64-char random hex>
```

Generate strong secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Start infrastructure

```bash
pnpm docker:up
```

### 5. Set up the database

```bash
pnpm db:generate     # generate Prisma client
pnpm db:migrate      # create and apply the first migration
pnpm db:seed         # seed a default admin user
```

### 6. Start the dev server

```bash
pnpm dev
```

The API is available at **`http://localhost:8080`**.

---

## 🔌 API Reference

### Health

| Method | URL | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | Server status + environment |
| GET | `/health` | Public | Health check with timestamp |

### Auth — `/api/v1/auth`

| Method | URL | Auth | Description |
|---|---|---|---|
| POST | `/register` | Public | Create account, receive JWT |
| POST | `/login` | Public | Authenticate, receive JWT |
| GET | `/me` | Bearer JWT | Retrieve own profile |

### Users — `/api/v1/users`

| Method | URL | Auth | Description |
|---|---|---|---|
| GET | `/` | Admin | List all users |
| GET | `/:id` | Authenticated | Get user by ID |
| PATCH | `/:id` | Authenticated | Update user profile |
| DELETE | `/:id` | Admin | Delete user permanently |

---

## 🔒 Authentication

This template uses **stateless JWT** authentication:

1. Call `POST /api/v1/auth/login` → receive a signed JWT.
2. Include the JWT in every protected request:
   ```
   Authorization: Bearer <token>
   ```
3. The `authenticate` middleware verifies the token and populates `req.user`.
4. The `authorize(...roles)` middleware enforces role-based access control.

Redis-backed sessions are available for features requiring server-side state
(e.g., OAuth2 flows), but the primary auth mechanism is stateless.

---

## ➕ Adding a New Feature

Every feature lives in its own directory under `src/features/`. Follow this
5-file pattern:

```
src/features/<name>/
├── <name>.types.ts       # TypeScript interfaces & DTOs
├── <name>.repository.ts  # Prisma queries (data access only)
├── <name>.service.ts     # Business logic → calls repository
├── <name>.controller.ts  # HTTP: parse request → call service → send response
├── <name>.routes.ts      # Express router + middleware
└── index.ts              # Barrel export (Gatekeeper)
```

### Step-by-step example — adding a `Post` feature

**1. Create the directory and files**

```bash
mkdir src/features/post
touch src/features/post/{post.types,post.repository,post.service,post.controller,post.routes,index}.ts
```

**2. Add the model to Prisma schema**

```prisma
// prisma/schema.prisma
model Post {
    id        String   @id @default(cuid())
    title     String
    body      String
    authorId  String
    author    User     @relation(fields: [authorId], references: [id])
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    @@map("posts")
}
```

```bash
pnpm db:migrate   # prompts for a migration name
pnpm db:generate  # regenerate Prisma client
```

**3. Implement the files** following the same pattern as `auth` or `user`.

**4. Mount the router in `src/routes/index.ts`**

```typescript
import postRoutes from "../features/post";

// inside registerRoutes():
const postRouter = Router();
postRouter.use("/posts", limiter, postRoutes);
app.use(API_PREFIX, session(sessionConfig), postRouter);
```

**5. Export via the barrel index**

```typescript
// src/features/post/index.ts
export { postController } from "./post.controller";
export { postService }    from "./post.service";
export type { CreatePostDto } from "./post.types";
export { default }        from "./post.routes";
```

---

## 🌍 Environment Variables

All environment configuration flows through `src/config/env.config.ts`.
**Never read `process.env` directly outside that file.**

| Variable | Default | Required | Description |
|---|---|---|---|
| `NODE_ENV` | `development` | | Runtime environment |
| `PORT` | `8080` | | HTTP server port |
| `CLIENT_URL` | `http://localhost:3000` | | Front-end URL (CORS + email links) |
| `DATABASE_URL` | — | ✅ | Prisma PostgreSQL connection string |
| `REDIS_URL` | `redis://localhost:6379` | | Redis connection URL |
| `JWT_SECRET` | — | ✅ | JWT signing secret (≥ 32 chars) |
| `JWT_EXPIRES_IN` | `1h` | | JWT expiry (e.g. `1h`, `7d`) |
| `SESSION_SECRET` | — | ✅ | Session encryption secret |
| `SMTP_HOST` | — | | SMTP server hostname |
| `SMTP_PORT` | `587` | | SMTP server port |
| `SMTP_USER` | — | | SMTP username |
| `SMTP_PASSWORD` | — | | SMTP password |
| `FROM_EMAIL` | `no-reply@example.com` | | Sender address |
| `EMAIL_TIMEOUT` | `10000` | | SMTP timeout in ms |
| `ENABLE_FILE_LOGGING` | `false` | | Write logs to `logs/` directory |
| `API_PREFIX` | `api/v1` | | URL prefix for all API routes |

---

## 🐳 Docker

Infrastructure only — the API itself runs locally via `pnpm dev`.

```bash
pnpm docker:up      # Start PostgreSQL + Redis (detached)
pnpm docker:down    # Stop containers, data is preserved
pnpm docker:reset   # Wipe all volumes and restart fresh
```

Containers use `restart: "no"` — they won't auto-restart unless you explicitly
run `pnpm docker:up` again.

---

## 🧪 Testing

```bash
pnpm test              # Run all tests once
pnpm test:coverage     # Run with coverage report
pnpm test --watch      # Watch mode
```

### Writing tests

```typescript
// tests/auth/auth.test.ts
import request from "supertest";
import { createApp } from "../../src/app";
import { clearDatabase } from "../fixtures";

const app = createApp();

beforeEach(clearDatabase);

describe("POST /api/v1/auth/register", () => {
    it("creates a user and returns a JWT", async () => {
        const res = await request(app)
            .post("/api/v1/auth/register")
            .send({ name: "Alice", email: "alice@test.com", password: "Password123!" });

        expect(res.status).toBe(201);
        expect(res.body.data.token).toBeDefined();
        expect(res.body.data.user.email).toBe("alice@test.com");
    });
});
```

### Test fixtures

```typescript
import { clearDatabase, seedModel } from "../fixtures";
import prisma from "../../src/core/database/prisma";

beforeEach(clearDatabase);

// Seed data
await seedModel(prisma.user, [{ name: "Bob", email: "bob@test.com", ... }]);
```

---

## 🛠️ Scripts Reference

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server with hot-reload |
| `pnpm build` | Compile TypeScript → `dist/` |
| `pnpm start` | Run the compiled production build |
| `pnpm test` | Run all tests |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Auto-fix lint errors |
| `pnpm format` | Format all files with Prettier |
| `pnpm format:check` | Check formatting without writing |
| `pnpm db:generate` | Regenerate Prisma client after schema changes |
| `pnpm db:migrate` | Create and apply a new migration |
| `pnpm db:migrate:deploy` | Apply pending migrations (production) |
| `pnpm db:push` | Push schema without migration (prototyping) |
| `pnpm db:studio` | Open Prisma Studio (visual DB browser) |
| `pnpm db:seed` | Seed the database |
| `pnpm docker:up` | Start Docker containers |
| `pnpm docker:down` | Stop Docker containers |
| `pnpm docker:reset` | Wipe data volumes and restart |

---

## ⚙️ VS Code Setup

Install the recommended extensions when prompted, or manually:

```bash
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension Prisma.prisma
```

The included `.vscode/settings.json` enables:
- **Format on save** (Prettier)
- **Auto-fix lint errors on save** (ESLint)
- **4-space indentation**
- Auto-organise imports on save

---

## 🔁 CI/CD

Two GitHub Actions workflows are included:

### `ci.yml` (on push/PR to `main` or `develop`)

| Job | What it does |
|---|---|
| `lint` | Checks formatting and runs ESLint |
| `typecheck` | Runs `tsc --noEmit` |
| `test` | Runs Jest with live Postgres + Redis services |
| `build` | Compiles TypeScript (runs after lint + typecheck) |

### `release.yml` (on `v*.*.*` tag push)

Automatically creates a GitHub Release with auto-generated changelog notes.

```bash
git tag v1.0.0
git push origin v1.0.0
```

---

## 📜 License

MIT — use this template freely in commercial and open-source projects.

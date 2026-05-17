# Express TypeScript API Template

A production-ready, feature-based REST API template built with **Express**, **TypeScript**, **Prisma** (PostgreSQL), and **Redis**. Clone it, rename it, and ship.

---

## ✨ Features

| Feature | Technology |
|---|---|
| HTTP Server | Express 4 |
| Language | TypeScript 5 (strict mode) |
| ORM | Prisma 5 + PostgreSQL |
| Caching / Sessions | Redis 7 |
| Authentication | JWT (jsonwebtoken) + bcrypt |
| Email | Nodemailer (SMTP) |
| Real-time | Socket.IO |
| Logging | Winston + daily log rotation |
| Testing | Jest + Supertest |
| Linting | ESLint + Prettier |
| Containerisation | Docker Compose |

---

## 📁 Project Structure

```
.
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Default seed data
├── src/
│   ├── config/              # App-wide configuration (env, CORS, rate-limit, session)
│   ├── features/            # Feature modules (self-contained)
│   │   ├── auth/
│   │   │   ├── auth.types.ts
│   │   │   ├── auth.repository.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.routes.ts
│   │   └── user/
│   │       ├── user.types.ts
│   │       ├── user.repository.ts
│   │       ├── user.service.ts
│   │       ├── user.controller.ts
│   │       └── user.routes.ts
│   ├── lib/
│   │   └── prisma.ts        # Prisma client singleton
│   ├── middlewares/         # Express middleware (auth guard, error handler, etc.)
│   ├── routes/
│   │   └── index.ts         # Central route mounting
│   ├── services/
│   │   └── core/            # Infrastructure services (Redis, Email, Socket.IO)
│   ├── types/               # Global TypeScript declarations
│   ├── utils/               # Shared utilities (logger, errors, auth helpers)
│   └── app.ts               # Express app factory
├── tests/                   # Integration & unit tests
├── server.ts                # Entry point
├── docker-compose.yml
├── .env.example
└── tsconfig.json
```

### Adding a new feature

1. Create `src/features/<name>/` with these files:

   | File | Responsibility |
   |---|---|
   | `<name>.types.ts` | TypeScript interfaces & DTOs |
   | `<name>.repository.ts` | Prisma queries (data access only) |
   | `<name>.service.ts` | Business logic, calls repository |
   | `<name>.controller.ts` | HTTP parsing, calls service |
   | `<name>.routes.ts` | Express router, applies middleware |

2. Import and mount the router in `src/routes/index.ts`.

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- pnpm ≥ 8
- Docker & Docker Compose

### 1. Clone & install

```bash
git clone <your-repo-url>
cd <project>
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — fill in DATABASE_URL, JWT_SECRET, SESSION_SECRET
```

Generate strong secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Start infrastructure

```bash
pnpm docker:up
```

### 4. Run database migrations

```bash
pnpm db:migrate      # development (creates migration files)
pnpm db:generate     # generate Prisma client after schema changes
pnpm db:seed         # seed default admin user
```

### 5. Start the dev server

```bash
pnpm dev
```

The API will be available at `http://localhost:8080`.

---

## 🔌 API Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Public | Create account |
| POST | `/api/v1/auth/login` | Public | Receive JWT |
| GET | `/api/v1/auth/me` | Bearer JWT | Current user profile |

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/users` | Admin | List all users |
| GET | `/api/v1/users/:id` | Bearer JWT | Get user by ID |
| PATCH | `/api/v1/users/:id` | Bearer JWT | Update user |
| DELETE | `/api/v1/users/:id` | Admin | Delete user |

### System

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | App status |
| GET | `/health` | Public | Health check |

---

## 🧪 Testing

```bash
pnpm test              # run all tests
pnpm test --watch      # watch mode
```

Tests live in `tests/` and use **Supertest** against an in-process Express instance.

---

## 🛠️ Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start development server (hot-reload) |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm start` | Run compiled production build |
| `pnpm lint` | Lint with ESLint |
| `pnpm format` | Format with Prettier |
| `pnpm db:migrate` | Create and apply a new migration |
| `pnpm db:studio` | Open Prisma Studio (DB GUI) |
| `pnpm docker:up` | Start Docker containers |
| `pnpm docker:reset` | Wipe volumes and restart containers |

---

## 🔒 Authentication Flow

This template uses **JWT-only** authentication:

1. `POST /api/v1/auth/login` returns a signed JWT.
2. The client sends the JWT in subsequent requests via `Authorization: Bearer <token>`.
3. The `authenticate` middleware verifies the token and attaches `req.user`.
4. The `authorize(...roles)` middleware enforces role-based access.

Redis-backed sessions are available for features that require server-side state (e.g., OAuth flows), but the primary auth mechanism is stateless JWT.

---

## 🐳 Docker

```bash
pnpm docker:up      # Start PostgreSQL + Redis
pnpm docker:down    # Stop containers (data preserved)
pnpm docker:reset   # Wipe all data and restart fresh
```

---

## 📜 License

MIT

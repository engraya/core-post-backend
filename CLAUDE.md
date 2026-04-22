# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start              # Dev server with hot reload (ts-node via nodemon)
npm run build          # Compile TypeScript → dist/
npm run start:prod     # Run compiled output (requires build first)
npm test               # Run tests once
npm run test:watch     # Run tests in watch mode
```

No linter is configured — there is no ESLint/Prettier setup.

## Architecture

TypeScript/Express backend for a blogging platform with email-verified JWT authentication.

**Request flow:** Router → Controller → Service → Model (MongoDB/Mongoose)

**Routes (all under `/api/v1`):**
- `/auth` — register, login, logout, email verification, password reset/change
- `/posts` — CRUD for blog posts (create/update/delete require `isAuthenticated` + `isVerified`)
- `/users` — list users, get user with their posts

**Key middleware:**
- `isAuthenticated` — validates JWT from `Authorization` cookie or `Bearer` header; attaches `req.user`
- `isVerified` — queries DB to confirm email verification (does not trust JWT payload alone)
- `asyncHandler` — wraps all controllers to forward promise rejections to the global error handler
- Rate limiters applied at the router level: `authLoginRegisterLimiter` (50/15min), `passwordFlowLimiter` (10/15min)

**Auth flow:** Registration → 6-digit OTP sent via email → `/verify-account` → login issues JWT (1h expiry). Passwords use bcryptjs (12 rounds); OTPs are HMAC-SHA256 hashed before storage with a 5-minute expiry timestamp.

**Error handling:** Throw `AppError` (from `src/errors/AppError.ts`) for expected errors; the global `errorHandler` middleware in `src/app.ts` catches all errors.

**Validation:** Joi schemas live in `src/utils/validator.ts` and are called at the top of each service function.

## Environment Variables

All required — no `.env.example` exists. See `src/config/env.ts` for the full list:

| Variable | Purpose |
|---|---|
| `PORT` | HTTP server port (default 8000) |
| `NODE_ENV` | `development` or `production` |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | JWT signing secret |
| `HMACPROCESS_KEY` | HMAC-SHA256 key for OTP hashing |
| `NODE_VERIFICATIONCODE_SENDING_EMAIL_ADDRESS` | Gmail address for sending OTPs |
| `NODE_VERIFICATIONCODE_SENDING_EMAIL_PASSWORD` | Gmail app password |

## Testing

Tests use Vitest + Supertest. The setup file (`vitest.setup.ts`) injects test values for all env vars, so no `.env` is needed to run tests. The test database URI defaults to a local MongoDB instance on port 27017.

To run a single test file:
```bash
npx vitest run src/app.test.ts
```

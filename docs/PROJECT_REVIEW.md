# Core Post Backend — Project Review & Learning Roadmap Alignment

**Review date:** April 10, 2026  
**Purpose:** Learning foundation for backend development, aligned with *2026 Backend Mastery Roadmap for Frontend Engineers*.

---

## Executive summary

`core-post-backend` is a solid **Express + TypeScript + MongoDB (Mongoose)** starter: REST-style routes, Joi validation, bcrypt password hashing, JWT with httpOnly cookies, Helmet, and email flows for verification and password reset. It maps well to **Phase 1 (foundations)** and parts of **Phase 4 (auth & security)** on your roadmap.

The highest-impact next steps are: fix a few **correctness/security gaps**, unify **module style and error handling**, add **tests and deployment**, then grow toward **Phase 3 (DB mastery)**, **Phase 5 (jobs/caching)**, and **Phase 6 (DevOps)** as described in your roadmap.

---

## What is implemented well

| Area | Notes |
|------|--------|
| **Stack choice** | Express + TS matches “learn fundamentals first”; Mongoose fits Phase 3 NoSQL exposure. |
| **Password storage** | `bcryptjs` with explicit cost factor; password field `select: false` on the user model. |
| **JWT + cookie** | `httpOnly`, `secure` in production, `sameSite: 'strict'` — good baseline for cookie-based sessions. |
| **Middleware auth** | Central `isAuthenticated` reading cookie or `Authorization` header. |
| **Input validation** | Joi schemas for auth and posts reduce invalid data reaching the DB. |
| **Security headers** | Helmet enabled globally. |
| **Domain modeling** | Clear `User` / `Post` schemas with timestamps; `populate` for author email on posts. |
| **Verification codes** | HMAC of codes before persistence avoids storing raw OTPs in the database. |
| **Pagination** | Post listing uses `skip` / `limit` and sort by `createdAt`. |

These choices align with your roadmap’s emphasis on **REST APIs**, **validation**, **password hashing**, and **JWT-oriented auth**.

---

## Correctness, security, and design issues to address

### High priority

1. **Forgot-password routes require authentication**  
   In `authRouter`, `forgot-password` and `verify-forgot-password` use `isAuthenticated`. Users who forgot their password typically **cannot** log in; these endpoints should be **public** (rate-limited), accepting email (and code + new password) without a valid JWT.

2. **Post update/delete: no ownership check**  
   Any authenticated user can update or delete any post if they know the ID. You should compare `post.userId` to `req.user.userId` (or use a query filter `{ _id, userId }`) before mutating.

3. **`register` error path**  
   The `catch` block logs only; the client may get **no response**. Return `500` with a generic message (and log server-side).

4. **Weak verification-code generation**  
   `Math.floor(Math.random() * 1000000)` is not cryptographically secure and can be biased. Prefer `crypto.randomInt` (Node) for OTPs.

5. **JWT secret typing**  
   `jwt.sign` / `verify` use `as string` on `JWT_SECRET`. If missing at runtime, verification throws. Validate required env vars **at startup** and fail fast.

### Medium priority

6. **HTTP status codes**  
   Validation failures are often `401`; **`400 Bad Request`** is more appropriate for malformed input. `401` should mean “not authenticated.”

7. **Inconsistent API responses**  
   Some endpoints use `{ success, message }`, others only `{ message }`. Standardize for easier frontend and testing.

8. **Password policy mismatch**  
   User model allows `minlength: 6` for password; Joi registration requires **8** characters. Align model, Joi, and login schema to one policy.

9. **Bug in verification mismatch response**  
   On wrong code, one branch returns **`success: true`** with `400` — should be `success: false` for wrong credentials.

10. **Email HTML**  
 Templates use `<h1>...</h1>` with a typo (`<h1>` closing). Minor, but fix for professionalism.

11. **Server vs database startup order**  
    `app.listen` runs before `mongoose.connect` resolves. Under load, early requests can hit the DB before it is ready. Prefer connecting to MongoDB first, then listening (or health checks that wait for DB).

### Lower priority / hygiene

12. **Mixed `require` and `import`**  
    Consistent ESM-style `import`/`export` (or full CommonJS) improves tree-shaking, types, and readability.

13. **`compression` in dependencies but unused**  
    Either wire it (`app.use(compression())`) or remove until needed.

14. **`dist/` and build artifacts**  
    `.gitignore` currently ignores `node_modules` and `.env` only. Consider ignoring `dist/` and committing only source (roadmap Phase 6: reproducible builds).

15. **Tests**  
    `npm test` is a placeholder. Automated tests are part of growing from tutorial code to **production API** mindset (roadmap Phases 2, 6, 15).

---

## Refactoring suggestions (incremental, learning-friendly)

1. **Thin controllers, fat services**  
   Move “business logic” (e.g. “register user”, “verify code”) into `services/` functions that controllers call. This mirrors **NestJS-style** layers without switching frameworks yet (roadmap Phase 2).

2. **Central error handler**  
   Express error-handling middleware + custom `AppError` class reduces duplicated `try/catch` and normalizes responses.

3. **Async handler wrapper**  
   Small wrapper to catch rejected promises in route handlers avoids forgotten `catch` blocks.

4. **Config module**  
   Single `config.ts` that reads and validates `process.env` (Zod or manual checks) — supports roadmap **environment configuration** theme.

5. **API versioning**  
   Mount routes at `/api/v1/...` as in roadmap Phase 1 (**API versioning**). Keeps future breaking changes manageable.

6. **Repository pattern (optional)**  
   Abstract `User.findOne` / `Post.find` behind functions or classes to simplify testing and future DB swaps (e.g. Prisma + PostgreSQL per roadmap Phase 3).

---

## Scaling and “cool features” (aligned with the roadmap)

Short-term (still monolith):

- **Rate limiting** (`express-rate-limit`) on auth and forgot-password routes — roadmap **Phase 4**.
- **Indexes**: `{ userId: 1, createdAt: -1 }` on posts for user timelines; text index if you add search.
- **Refresh tokens** + rotation; shorter access JWT — roadmap **Phase 4**.
- **Redis**: session or rate-limit store, then cache hot reads — **Phase 3 / 5**.
- **BullMQ** (or similar) for sending email off the request path — **Phase 5 background jobs**.
- **WebSockets** for live notifications on new posts — **Phase 5**.
- **Structured logging** (pino/winston) + request IDs — **Phase 6**.

Medium-term:

- **PostgreSQL + Prisma** for relational data (comments, likes, follows) alongside or instead of Mongo — roadmap **blog platform**-style project.
- **Docker Compose** (API + Mongo + Redis) — **Phase 6**.
- **CI** (GitHub Actions: lint, test, build) — **Phase 6**.

Long-term / portfolio (from your roadmap):

- **Notification system** (Phase 5 project).
- **AI document assistant** (upload, extract, semantic search) using embeddings + vector DB — **Phase 7**.

---

## Feature ideas to build on this repo

Suitable as **learning increments** on top of posts + auth:

| Feature | Skills practiced |
|--------|------------------|
| Comments / nested replies | Schema design, aggregation |
| Likes or bookmarks | Unique compound indexes, concurrency |
| User profiles (display name, avatar URL) | File uploads → S3 later |
| Full-text search | MongoDB text index or move search to Postgres |
| Admin role + authorization middleware | RBAC, roadmap security |
| Email verification before login | Stricter auth flow |
| OAuth (Google) | Roadmap Phase 4 project theme |
| Audit log table | Compliance-minded design |

---

## Mapping this project to your 2026 roadmap

| Roadmap phase | How this repo fits | Suggested next focus |
|---------------|--------------------|----------------------|
| **Phase 1 — Foundations** | REST routes, middleware, async/await, validation | API versioning, consistent errors, HTTP semantics |
| **Phase 2 — Framework mastery** | Express controllers | Extract services; optionally try NestJS or Fastify on a branch |
| **Phase 3 — Database mastery** | MongoDB + Mongoose | Indexes, transactions (if multi-document), try Prisma + Postgres in parallel |
| **Phase 4 — Auth & security** | JWT, cookies, bcrypt, HMAC codes | Refresh tokens, rate limits, fix forgot-password flow, OAuth |
| **Phase 5 — System design** | Monolith CRUD | Redis cache, queues, notifications, WebSockets |
| **Phase 6 — DevOps** | Manual run | Docker, env per stage, CI/CD, health/readiness endpoints |
| **Phase 7 — AI backends** | Not started | RAG or semantic search over post content |

Your roadmap’s **portfolio strategy** lists six demonstration projects (authentication service, production API, database-heavy system, background job queue, AI-powered service, deployed application). This repo already fits the **authentication service** theme and can grow toward a **production API**, richer **database** usage, and a **job queue** with the additions above.

---

## What to learn next (concrete order)

1. **Fix the issues above** in this codebase (ownership, forgot password, register catch, OTP generation) — immediate confidence boost.  
2. **Automated testing**: Jest or Vitest + Supertest for auth and post CRUD.  
3. **PostgreSQL + Prisma** (or TypeORM) on a **second** small module — roadmap Phase 3 depth.  
4. **Docker**: containerize API + Mongo; optional Redis.  
5. **Refresh tokens + OAuth** — roadmap Phase 4 projects.  
6. **Background jobs** (BullMQ) for email — Phase 5.  
7. **Read on**: Node event loop + streams (roadmap Node specialization) in parallel with features.

---

## Closing

This project is a **credible beginner backend foundation**: it already touches auth, email, validation, and persistence. Closing the security and consistency gaps, then layering **tests, versioning, and deployment**, will move it from “tutorial quality” toward **roadmap-aligned, portfolio-ready** work. Treat each improvement as a single learning goal; your daily roadmap mix (theory + implementation + AI-assisted review + production skills) fits this evolution well.

---

*Generated as a learning review; adjust priorities based on your current phase in the 2026 roadmap.*

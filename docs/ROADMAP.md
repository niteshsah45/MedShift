# Roadmap (6-month window)

Don't move to the next phase until the current one works end-to-end (backend + frontend + manually tested). Half-finished phases stacked on each other is how projects collapse near deadline.

## Phase 0 — Setup (2-3 days)
- [ ] Init backend: minimal folder structure (see below), DB connection, `.env`
- [ ] Init frontend: Vite + React + Tailwind
- [ ] Push to GitHub, connect Atlas
- [ ] Deploy a "hello world" version of both immediately (Vercel + Render) — do this now, not in week 20

**Minimal starting backend structure — don't scaffold more than this yet:**
```
backend/src/
├── config/db.js
├── models/
│   ├── User.js
│   ├── Hospital.js
│   ├── Professional.js
│   ├── StaffingRequest.js
│   └── Application.js
├── controllers/
│   ├── auth.controller.js
│   ├── hospital.controller.js
│   ├── professional.controller.js
│   ├── request.controller.js
│   └── application.controller.js
├── routes/  (mirrors controllers, + index.js)
├── middlewares/
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   └── error.middleware.js
├── services/
│   ├── request.service.js
│   ├── application.service.js
│   ├── eligibility.service.js
│   └── conflict.service.js
├── validators/ (Zod schemas)
├── utils/
│   ├── ApiError.js
│   └── asyncHandler.js
├── app.js
└── server.js
```
Add `Assignment.js` model + `assignment.controller.js`/`routes` once you reach the Accept step in Phase 1. Add `jobs/`, `sockets/`, `notifications/`, `admin/` only in Phase 4+, when that code actually exists.

## Phase 1 — V1: Core Flow Only (1-2 weeks)
- [ ] Basic register/login (JWT) — no RBAC middleware yet, just "logged in or not"
- [ ] Hospital profile create/view/edit
- [ ] Professional profile create/view/edit
- [ ] Create Staffing Request (Hospital)
- [ ] Browse Staffing Requests (Professional) — plain list, no filters
- [ ] Apply to a request → Application (PENDING) — no eligibility/conflict check yet
- [ ] Hospital views applicants, Accept/Reject
- [ ] Accept → create Assignment, increment `positionsFilled` (naive version is fine here — concurrency-safety comes in Phase 2)

**Milestone:** the full object chain works — Request → Application → Assignment — even if unpolished and unprotected. This is intentionally the smallest possible working version.

## Phase 2 — V2: Auth, RBAC, Verification (1-2 weeks)
- [ ] RBAC middleware (`allowRoles`) applied to all routes
- [ ] Admin role + admin-only routes
- [ ] Verification workflow: submit docs → Admin approves/rejects (Multer → Cloudinary, synthetic docs only)
- [ ] Application status transitions properly enforced (PENDING → ACCEPTED/REJECTED/WITHDRAWN)
- [ ] **Concurrency-safe accept** — replace naive accept logic with atomic `findOneAndUpdate`
- [ ] Unique index preventing duplicate applications to the same request

**Milestone:** real authorization and your first genuinely hard bug class (concurrency) exist and are solved.

## Phase 3 — V3: Smart Logic (1-2 weeks) — the actual point of the project
- [ ] Eligibility check before allowing apply (role, min experience, specialization)
- [ ] Schedule conflict detection — overlap check against existing `Assignment` records
- [ ] Search/filter/sort on Staffing Requests via `req.query`
- [ ] Pagination
- [ ] Indexes for the above queries

**Milestone:** the three strongest interview stories exist and work. Don't rush or skip this phase.

## Phase 4 — V4: Advanced (1-2 weeks, pick 1-2 as a coherent chain)
- [ ] Notifications collection + simple polling (build this first regardless — cheapest, most justified)
- [ ] BullMQ + Redis to process notifications async (only once polling feels like a real limitation)
- [ ] Socket.io for live applicant count on Hospital dashboard (only once there's a concrete "this should update without refresh" moment)

## Phase 5 — V5: Polish + Deploy (1 week)
- [ ] Ratings after completed shift (optional)
- [ ] Simulated payment status field (optional)
- [ ] Error handling audit (consistent shape everywhere)
- [ ] Validation audit (every route validated with Zod)
- [ ] Loading/error states on frontend
- [ ] README: pitch, scope disclaimer, screenshots/demo GIF, setup instructions, link to `docs/`
- [ ] Final deploy + smoke test on production URLs
- [ ] Record a short demo video for your portfolio

## Buffer
~7-10 weeks of focused work fits inside your 6-month window. Use the slack for:
- DSA/interview prep in parallel — don't let this project eat 100% of your time
- Tests for the trickiest logic (conflict detection, concurrency) — even 10-15 tests is a strong signal
- Mock interview walkthroughs of your own architecture — practice explaining decisions #2, #5, #6 from ARCHITECTURE.md out loud

## Explicitly do NOT do
- Don't scaffold folders/features before you need them
- Don't add microservices, Kafka, Kubernetes, GraphQL, Redux
- Don't build real payment processing or real credential verification
- Don't add Redis/BullMQ/Socket.io before Phase 4, and don't add all three at once
- Don't rewrite the stack mid-project because a new tutorial looked cool

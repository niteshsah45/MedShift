# Architecture

## System overview (V1–V3)
```
        React (Vite)
             │
             ▼
      Express REST API
             │
     ┌───────┴────────┐
     ▼                ▼
Auth Middleware    Zod Validation
     │                │
     └───────┬────────┘
             ▼
        Controllers          ← thin: parse request, call service, shape response
             ▼
          Services           ← ALL business logic lives here
   (eligibility, conflict,
    request, application)
             ▼
          Mongoose
             ▼
          MongoDB
```

## System overview (V4+, target — grow into this, don't start here)
```
                         React (Vite)
                              │
                              ▼
                       Express API
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
             Auth Middleware       Zod Validation
                    │                   │
                    └─────────┬─────────┘
                              ▼
                         Controllers
                              ▼
                          Services
                              ▼
                          MongoDB
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
              Redis                    Job Queue (BullMQ)
                                             │
                                             ▼
                                          Worker
                                             │
                                    Notification Service
                                             │
                                             ▼
                                        Socket.io → Client
```

## Tech stack — final

### Frontend
- **React** (Vite)
- **React Router**
- **Axios** (with interceptor attaching JWT)
- **Context API** for auth/user state — **not Redux**. Global state here is just `user`, `token`, `role`, `isAuthenticated`. Redux is unjustified complexity at this scale.
- **Tailwind CSS**
- **React Hook Form + Zod** — form handling + validation, same schema library as backend
- *(V4+)* **Socket.io-client**

### Backend
- **Node.js + Express**
- **MongoDB + Mongoose**
- **jsonwebtoken**, **bcrypt**
- **Zod** for request validation — picked over express-validator so one schema-thinking approach is used across frontend and backend
- **multer** → **Cloudinary** for verification document uploads (store URL + metadata in Mongo, never raw file binary, never real documents)
- **cors, dotenv, morgan**
- *(V4+)* **BullMQ + Redis**, **Socket.io**, **node-cron**

### Database
- **MongoDB Atlas** (free tier)

### Deployment
- Frontend → **Vercel**, Backend → **Render/Railway**, DB → **Atlas**
- *(V5)* **Docker** — only after the app already works end-to-end

### Explicitly excluded
Redux, GraphQL, Kafka, Kubernetes, Elasticsearch, AI/ML — none solve a problem this project actually has.

## Key architectural decisions

### 1. Folder structure grows with features, not upfront
Don't scaffold 30 folders on day one. Start minimal (below) and add `jobs/`, `sockets/`, `notifications/`, `admin/` only when you write the code that belongs there. You understand architecture better by physically adding a service when you hit the business logic that needs it, not by pre-guessing structure.

### 2. User is auth-only; Hospital/Professional are separate profile documents
**Resolved decision:** earlier drafts considered a single User model with all fields (or leaving the choice open). Final answer: **split them.**
```
User                     Professional              Hospital
├── email                ├── userId (ref)          ├── userId (ref)
├── password              ├── name                   ├── name
└── role                  ├── specialization         ├── address
                          ├── experience              ├── departments
                          ├── qualifications          └── verificationStatus
                          └── verificationStatus
```
Why: a merged model ends up with fields that are meaningless depending on role (`licenseNumber` on a hospital record, `hospitalAddress` on a professional record). Splitting keeps auth identity and business/domain data cleanly separated — a real pattern worth being able to explain, not just a style preference.

### 3. Services layer, separate from controllers
Controllers: parse request → call service → shape response. All business logic (eligibility, conflict detection, position-filling) lives in `services/`. Keeps controllers thin and logic testable in isolation.

Full request flow for the most important endpoint in the app:
```
POST /api/v1/requests/:id/apply
             │
             ▼
       authMiddleware
             │
             ▼
       roleMiddleware
             │
             ▼
     applicationController
             │
             ▼
     applicationService
             │
       ┌─────┴──────┐
       ▼            ▼
eligibility     conflict
  service        service
       │            │
       └─────┬──────┘
             ▼
          MongoDB
```

### 4. Application and Assignment are separate collections
- **Application** = "I want this shift" (PENDING/ACCEPTED/REJECTED/WITHDRAWN)
- **Assignment** = "I am confirmed for this shift" (created only when Hospital accepts)

Mirrors how real systems (hiring pipelines, job boards) separate intent from confirmed outcome.

### 5. Concurrency-safe position filling
Naive read-then-write has a race condition under concurrent accepts. Use an atomic MongoDB update combining the check and increment in one operation:
```js
StaffingRequest.findOneAndUpdate(
  { _id: requestId, $expr: { $lt: ["$positionsFilled", "$positions"] } },
  { $inc: { positionsFilled: 1 } },
  { new: true }
);
```
If the update returns `null`, the position was already filled — reject the accept. This is the single strongest thing to be able to explain in an interview.

### 6. Schedule conflict detection — no separate Availability model needed
**Resolved decision:** earlier drafts considered adding an `Availability` model. Final answer: **skip it.** Conflict detection only needs to check the new request's time window against the professional's *existing confirmed Assignments* — the data already needed for that lives on `Assignment`. Adding a separate Availability model would be designing for a feature (open availability windows) the project doesn't actually require yet.
```
existingStart < newEnd  AND  existingEnd > newStart  →  CONFLICT
```
Index `{ professionalId: 1, date: 1 }` on `Assignment` to make the lookup efficient.

### 7. Department stays a plain field, not a model
`department: "Emergency"` on `StaffingRequest` is enough for V1–V3. Only promote it to its own model if hospitals need custom, per-hospital department lists — don't design for that hypothetical now.

### 8. Skip a dedicated ApiResponse abstraction
Keep `ApiError` and `asyncHandler`, but don't build an `ApiResponse` wrapper class. A plain, consistent inline shape is enough and avoids an abstraction with no real payoff at this scale:
```js
res.status(201).json({ success: true, data: request });
```

### 9. RBAC middleware design
One reusable middleware, applied per-route:
```js
router.post('/requests', verifyToken, allowRoles('hospital'), createRequest);
```

### 10. API versioning
All routes under `/api/v1/...`, combined in `routes/index.js`, mounted once in `app.js` via `app.use("/api/v1", routes)`.

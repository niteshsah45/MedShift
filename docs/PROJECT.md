# MedShift — Healthcare Workforce Marketplace (Educational Prototype)

> This doc set reflects the final, reconciled plan after two rounds of review. Where earlier drafts disagreed, the resolution taken is noted inline so you understand *why*, not just *what*.

## One-line pitch
Hospitals post temporary staffing requirements, and verified doctors/nurses discover, evaluate, and apply for shifts based on qualifications, availability, location, and experience.

## Explicit scope disclaimer
This is an **educational prototype**, not production healthcare software. It does **not**:
- Store or process patient medical records
- Perform real credential/license verification (verification is simulated via an admin-approval workflow, using synthetic/demo documents only — never real people's medical licenses or IDs)
- Handle real payments or financial settlement
- Claim HIPAA/legal compliance

Say this explicitly in your README and out loud in interviews. It signals engineering judgment, not a gap you missed.

## Why this project (not a management-system CRUD app)
A library/school/college management system has one actor and simple status flags — no real decision-making. This project has **two actors with opposing perspectives on the same data** (hospital wants positions filled, professional wants shifts), which forces real backend engineering:

- Matching/discovery, not just listing
- Multi-step state machines (`Application` → `Assignment`, deliberately not merged)
- A genuine concurrency problem (don't let `positionsFilled` exceed `positions`)
- Time-overlap / schedule-conflict detection
- RBAC across 3 roles (Hospital, Professional, Admin)

**The core mental model — think workflows, not CRUD:**
```
HOSPITAL
   │
   ▼
Create Staffing Request
   │
   ▼
PUBLISHED
   │
   ├───────────────┬───────────────┐
   ▼                                ▼
Professional A                Professional B
   │                                │
   └────────────── Apply ───────────┘
                    │
                    ▼
              APPLICATION
                    │
             Hospital decision
               /          \
          ACCEPT         REJECT
             │
             ▼
         ASSIGNMENT
             │
             ▼
           SHIFT
             │
             ▼
         COMPLETED
```
Every feature you build should trace back to this workflow. If a feature doesn't serve it, it's scope creep — cut it.

## Actors
| Actor | Description |
|---|---|
| **Hospital** | Creates staffing requests, reviews applicants, accepts/rejects, rates professionals |
| **Professional** (Doctor/Nurse) | Builds profile, browses/searches requests, applies, views assignments |
| **Admin** | Verifies hospitals & professionals, moderates, oversees platform activity |

## Feature scope — resolved final version

### V1 (build this first, nothing else)
```
        V1
         │
   ┌─────┴─────┐
   ▼           ▼
Hospital   Professional
   │           │
   ▼           ▼
Create      Browse
Request     Requests
               │
               ▼
             Apply
   │           │
   └─────┬─────┘
         ▼
  Hospital sees
   applications
         ▼
  Accept / Reject
         ▼
     Assignment
```
No RBAC middleware yet, no verification, no eligibility/conflict checks — just basic login. Prove the core object flow works end to end: Request → Application → Assignment. This is intentionally smaller than earlier drafts suggested — get this working before adding anything else.

### V2 — Auth, RBAC, Verification
- JWT auth for Hospital, Professional, Admin
- RBAC middleware (`allowRoles`)
- Admin verification workflow (PENDING → APPROVED/REJECTED)
- File uploads (Multer → Cloudinary) for verification documents
- **Concurrency-safe accept** (atomic `positionsFilled` update — the single best interview talking point in this project)

### V3 — Smart Logic (the actual point of the project)
- Eligibility check (role, experience, specialization match) before allowing apply
- Schedule conflict detection — overlap check against existing `Assignment` records (no separate `Availability` model needed; see Architecture doc)
- Search/filter/sort/pagination on Staffing Requests
- DB indexes supporting the above

### V4 — pick 1–2, not all 3
- Notifications (start as a plain collection + polling, no queue)
- BullMQ + Redis (only once polling notifications actually feel slow/synchronous)
- Socket.io (only once you can point to a concrete "this needs to update live" moment — applicant count updating without refresh)

Build these as a coherent chain if you do more than one: Notifications → Background job → Real-time push. Don't add all three independently just because they're impressive-sounding.

### V5 — Maturity pass
- Testing (prioritize: conflict detection, concurrency-safe accept)
- Docker (only after the app works — don't learn Docker and business logic simultaneously)
- Deployment, logging, rate limiting, basic security hardening
- Ratings/reviews, simulated payment status (optional, cosmetic at this point)

## Explicitly out of scope — do not build
- Patient medical records, diagnosis, prescriptions
- Real license/credential verification against a registry
- Hospital billing / insurance claims
- Microservices, Kubernetes, Kafka, GraphQL, Elasticsearch, AI/ML matching
- Redux (Context API is sufficient at this scale)

## Interview talking points this project gives you
1. **Concurrency-safe accept flow** — how over-filling positions is prevented (atomic update)
2. **Application vs Assignment modeling** — why these are separate collections
3. **Schedule conflict detection** — interval overlap logic, indexing strategy
4. **User/Profile separation** — why auth identity and role-specific profile data are split into different documents instead of one bloated User model
5. **RBAC design** — one reusable middleware handling 3 roles
6. **What you deliberately left out and why** — engineering judgment, not just execution

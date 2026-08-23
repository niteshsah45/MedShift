# MedShift — Project Docs Index

This is the final, reconciled version of the doc set after review. Drop this folder into your repo as `docs/`.

## Read in this order
1. **[PROJECT.md](./PROJECT.md)** — what you're building, why, scope disclaimer, feature scope by phase, interview talking points
2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** — tech stack, system diagrams, and every key design decision with the reasoning behind it
3. **[DATABASE.md](./DATABASE.md)** — final Mongoose schemas, relationships, and a table of models deliberately NOT built
4. **[API.md](./API.md)** — full endpoint reference, tagged by which phase introduces each one
5. **[ROADMAP.md](./ROADMAP.md)** — checkbox-driven phase-by-phase build plan, starting from a minimal folder structure

## What changed in this final pass (vs. the first draft)
| Area | First draft | Final decision |
|---|---|---|
| Folder structure | Full structure scaffolded upfront | Minimal V1 structure only; folders added when the feature exists |
| User model | Single model or "pick one" | Split: `User` (auth only) + `Professional`/`Hospital` (profile) |
| Availability | Considered a separate model | Skipped — `Assignment` records already carry the data conflict-checking needs |
| Department | Considered a separate model | Plain field on `StaffingRequest` |
| ApiResponse | Included as a utility | Dropped — plain inline JSON shape is enough |
| Validation library | "Pick express-validator or Zod" | Zod, locked in — same schema approach on frontend and backend |
| V1 scope | Included RBAC, verification, search | Stripped down to just Request → Application → Assignment |
| Redis/BullMQ/Socket.io | Planned as "later" | Explicitly gated to V4, and only 1–2 of the 3, not all at once |

## How to use these while building
- Check off `ROADMAP.md` items as you go — commit it alongside code so your Git history shows progress against a real plan
- Cross-check new models against `DATABASE.md` so schemas stay consistent
- Keep `API.md` accurate as you add routes — don't let it drift from the real code
- Before interviews, re-read the "Interview talking points" in `PROJECT.md` and the "Key architectural decisions" in `ARCHITECTURE.md`, and practice explaining each one unscripted

## Suggested repo layout
```
medshift/
├── backend/
├── frontend/
├── docs/
│   ├── PROJECT.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   └── ROADMAP.md
└── README.md   ← shorter, public-facing: pitch, demo GIF, setup, link into docs/
```

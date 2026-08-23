# API Reference

Base URL: `/api/v1`
All protected routes require `Authorization: Bearer <token>`.

Endpoints are grouped by which phase (V1–V5) introduces them — build/test in that order.

## Auth (V1)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register as hospital or professional |
| POST | `/auth/login` | Public | Login, returns JWT |
| GET | `/auth/me` | Authenticated | Get current user |

## Hospital (V1 basic, V2 verification)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/hospitals` | Authenticated (hospital) | Create hospital profile |
| GET | `/hospitals/:id` | Authenticated | View hospital profile |
| PATCH | `/hospitals/:id` | Owner only | Update hospital profile |
| POST | `/hospitals/:id/documents` | Owner only | *(V2)* Upload verification documents |

## Professional (V1 basic, V2 verification)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/professionals` | Authenticated (professional) | Create professional profile |
| GET | `/professionals/:id` | Authenticated | View professional profile |
| PATCH | `/professionals/:id` | Owner only | Update professional profile |
| POST | `/professionals/:id/documents` | Owner only | *(V2)* Upload verification documents |

## Staffing Requests (V1 basic, V3 search/filter)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/requests` | hospital | Create staffing request |
| GET | `/requests` | Authenticated | Browse — V1: plain list. V3: adds query params below |
| GET | `/requests/:id` | Authenticated | View single request |
| PATCH | `/requests/:id` | Owner hospital | Edit (only if OPEN) |
| DELETE | `/requests/:id` | Owner hospital | Cancel request |
| GET | `/requests/:id/applicants` | Owner hospital | List applicants |

**V3 query params for `GET /requests`:**
```
role=doctor&city=Delhi&date=2026-09-04&minPay=4000
&specialization=Emergency+Medicine&page=1&limit=10&sort=-compensation
```

## Applications (V1 basic accept/reject, V3 adds eligibility+conflict checks)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/requests/:id/apply` | professional | V1: create Application. V3: runs eligibility + conflict check first |
| GET | `/applications/mine` | professional | List own applications |
| PATCH | `/applications/:id/withdraw` | Owner professional | Withdraw |
| PATCH | `/applications/:id/accept` | Owner hospital | Accept → creates Assignment. V2: concurrency-safe |
| PATCH | `/applications/:id/reject` | Owner hospital | Reject |

## Assignments (V1)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/assignments/mine` | professional | List own assignments |
| GET | `/assignments/hospital` | hospital | List assignments for own requests |
| PATCH | `/assignments/:id/complete` | hospital | Mark completed |
| PATCH | `/assignments/:id/cancel` | Owner (either party) | Cancel |

## Admin (V2)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/admin/verifications/pending` | admin | List pending verifications |
| PATCH | `/admin/hospitals/:id/verify` | admin | Approve/reject hospital |
| PATCH | `/admin/professionals/:id/verify` | admin | Approve/reject professional |
| GET | `/admin/stats` | admin | Platform activity overview |

## Notifications (V4)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/notifications` | Authenticated | List own notifications |
| PATCH | `/notifications/:id/read` | Owner | Mark as read |

## Ratings (V5)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/assignments/:id/rate` | Either party, post-completion | Submit rating |
| GET | `/professionals/:id/ratings` | Authenticated | View ratings |

## Standard response shape
No `ApiResponse` wrapper class — plain, consistent inline JSON:
```json
// Success
{ "success": true, "data": { ... }, "message": "Request created successfully" }

// Error
{ "success": false, "message": "Position already filled", "statusCode": 409 }
```

## Key error cases to handle explicitly
- `409 Conflict` — schedule overlap, or positions already filled
- `403 Forbidden` — wrong role, or not the resource owner
- `422 Unprocessable Entity` — eligibility check failed
- `401 Unauthorized` — missing/invalid/expired token

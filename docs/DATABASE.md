# Database Schema (Mongoose / MongoDB)

Final schema — reflects the resolved User/Profile split and the decision to skip a separate Availability model. Fields marked `(V4+)` aren't needed until that phase.

## User — authentication/identity ONLY
```js
{
  _id,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // bcrypt hashed
  role: { type: String, enum: ['hospital', 'professional', 'admin'], required: true },
  createdAt,
  updatedAt
}
```
Deliberately minimal. No domain-specific fields here — see the "Why" note in ARCHITECTURE.md decision #2.

## Professional — profile, linked to User
```js
{
  _id,
  userId: { type: ObjectId, ref: 'User', required: true, unique: true },
  name: String,
  role: { type: String, enum: ['doctor', 'nurse'] },
  specialization: String,
  experienceYears: Number,
  qualifications: [String],
  city: String,
  verificationStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  verificationDocuments: [String], // Cloudinary URLs, synthetic/demo docs only
  rating: { type: Number, default: 0 },          // (V5)
  completedShifts: { type: Number, default: 0 }, // (V5)
  createdAt
}
```

## Hospital — profile, linked to User
```js
{
  _id,
  userId: { type: ObjectId, ref: 'User', required: true, unique: true },
  name: String,
  city: String,
  address: String,
  departments: [String],   // plain field, not a separate model (see ARCHITECTURE.md #7)
  verificationStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  verificationDocuments: [String],
  createdAt
}
```

## StaffingRequest
```js
{
  _id,
  hospitalId: { type: ObjectId, ref: 'Hospital', required: true },
  title: String,
  department: String,           // plain field
  role: { type: String, enum: ['doctor', 'nurse'] },
  description: String,
  date: Date,
  startTime: String,            // "08:00"
  endTime: String,              // "16:00"
  positions: { type: Number, required: true },
  positionsFilled: { type: Number, default: 0 },
  minimumExperience: Number,
  requiredSpecialization: String,
  compensation: Number,
  city: String,
  status: { type: String, enum: ['OPEN', 'FILLED', 'CLOSED'], default: 'OPEN' },
  applicationDeadline: Date,
  createdAt
}
```
**Index:** `{ city: 1, date: 1, role: 1 }` — supports browse/search/filter.

## Application
```js
{
  _id,
  staffingRequestId: { type: ObjectId, ref: 'StaffingRequest', required: true },
  professionalId: { type: ObjectId, ref: 'Professional', required: true },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'], default: 'PENDING' },
  message: String,
  appliedAt: { type: Date, default: Date.now }
}
```
**Index:** `{ staffingRequestId: 1, professionalId: 1 }` unique — prevents duplicate applications.

## Assignment — also doubles as the conflict-detection source of truth
```js
{
  _id,
  staffingRequestId: { type: ObjectId, ref: 'StaffingRequest', required: true },
  applicationId: { type: ObjectId, ref: 'Application', required: true },
  professionalId: { type: ObjectId, ref: 'Professional', required: true },
  hospitalId: { type: ObjectId, ref: 'Hospital', required: true },
  date: Date,
  startTime: String,
  endTime: String,
  status: { type: String, enum: ['CONFIRMED', 'COMPLETED', 'CANCELLED'], default: 'CONFIRMED' },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID'], default: 'PENDING' }, // (V5, simulated)
  createdAt
}
```
**Index:** `{ professionalId: 1, date: 1 }` — used directly by `conflict.service.js`. No separate `Availability` model is created; a professional's confirmed `Assignment` records ARE their unavailability, which is all conflict detection needs.

## Notification (V4)
```js
{
  _id,
  userId: { type: ObjectId, ref: 'User', required: true },
  type: String,          // 'APPLICATION_ACCEPTED', 'NEW_MATCHING_REQUEST', etc.
  message: String,
  read: { type: Boolean, default: false },
  createdAt
}
```

## Rating (V5)
```js
{
  _id,
  assignmentId: { type: ObjectId, ref: 'Assignment', required: true },
  fromUserId: { type: ObjectId, ref: 'User' },
  toUserId: { type: ObjectId, ref: 'User' },
  score: { type: Number, min: 1, max: 5 },
  comment: String,
  createdAt
}
```

## Entity relationships
```
User 1───1 Hospital
User 1───1 Professional

Hospital 1───* StaffingRequest
StaffingRequest 1───* Application
Application 1───1 Assignment      (only when accepted)
Professional 1───* Application
Professional 1───* Assignment     (also = their unavailability record)
Assignment 1───* Rating           (V5)
```

## Models NOT created (and why)
| Model considered | Decision | Reason |
|---|---|---|
| `Availability` | Skip | `Assignment` already has the time data conflict-checking needs |
| `Department` | Skip (use field) | No hospital needs custom departments yet — don't design for hypothetical scale |
| `ApiResponse` (not a DB model, but same principle) | Skip | No payoff over a plain inline JSON shape at this scale |

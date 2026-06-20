# SmartCampus — Review Changelog

Reviewed snapshot: `smartcampus-approval-module` (the latest/most complete of the
five nested module zips bundled in the upload — 137 files, superset of the
other four). Five existing files were modified, two files were added, one
dead file was removed. No modules were regenerated from scratch.

---

## 🔴 Critical — project would not compile

### 1. `AdminService.java`
- `UserProfileResponse.fromUser(...)` was called 3× but the DTO only defines
  `from(...)`. → renamed all call sites to `.from(...)`.
- `Role.STUDENT` / `Role.ADMIN` used with no import for `Role` at all. →
  added `import com.smartcampus.model.enums.Role;`.
- `User.builder().department(request.getDepartment())` — `User` has no
  `department` field/builder method, only `departmentName`. → changed to
  `.departmentName(request.getDepartment())`.

### 2. `dto/CreateManagedUserRequest.java`
- Imported `com.smartcampus.model.Role`, which doesn't exist — the enum
  lives at `com.smartcampus.model.enums.Role`. → fixed the import path.

---

## 🔴 Critical — core feature silently dead

### 3. `BookingService.java` — approval workflow never triggered
`create()` injected `ApplicationEventPublisher eventPublisher` but never
called `publishEvent(...)`. Result: `BookingCreatedEvent` was never raised,
`BookingEventListener` never ran, and `ApprovalService.createApprovalRecords`
was never invoked — so bookings routed to `PENDING_HOD` / `PENDING_ADMIN` got
no `BookingApproval` row and could never appear in an approver's queue or be
acted on.
→ Added `eventPublisher.publishEvent(new BookingCreatedEvent(this, saved));`
immediately after the booking is saved in `create()`.

---

## 🔴 Critical — primary user flow unusable

### 4. Students/faculty couldn't load the booking form
`ResourceController` (`/admin/resources`) and the only user-search endpoint
(`/admin/users`, inside `AdminController`) were both class-level
`@PreAuthorize("hasRole('ADMIN')")`. The frontend booking flow
(`bookingApi.getActiveResources`, `searchFaculty`, `searchUsers`) calls
exactly those endpoints to populate the resource picker and the
coordinator/faculty picker — meaning any non-admin opening "New Booking"
would get 403s and a broken form.

**Fix:** added a new `UserController` with two read-only, any-authenticated-
user endpoints, and pointed the frontend at them instead:
- `GET /resources` — active, bookable resources only (delegates to the
  existing `ResourceService.search`, with `isActive` pinned `true` so it
  can't be used to discover inactive/maintenance resources).
- `GET /users/lookup` — minimal people search (id, name, email, role,
  department only — no phone number, register number, or account-status
  fields). Requires ≥2 search characters so it can't be used to dump the
  full user directory.

  Added `dto/user/UserLookupResponse.java` as the slim projection used by
  this endpoint, kept separate from the richer admin-only
  `UserProfileResponse`.

  Updated `frontend/src/api/bookingApi.js` to call `/resources` and
  `/users/lookup` instead of `/admin/resources` and `/admin/users`. Verified
  the response shape (`{ success, message, data: { content: [...] } }`)
  matches what `ResourcePicker.jsx` and `PeoplePicker.jsx` already expect, so
  no frontend component changes were needed beyond the API client.

  Admin-only CRUD on resources and users is untouched — `/admin/resources`
  and `/admin/users` still require `ROLE_ADMIN` exactly as before.

---

## 🟠 Security

### 5. IDOR on document download
`BookingService.downloadDocument(bookingId, documentId, requesterEmail)`
checked that the *booking* belonged to the requester, but then fetched the
document by `documentId` alone via `documentRepository.findById(documentId)`
— never confirming that document actually belonged to `bookingId`. A caller
authorised for their own booking could swap in any other booking's
`documentId` and download files they shouldn't have access to.
→ Added a check that `doc.getBooking().getId().equals(bookingId)`, returning
`404 Not Found` (not `403`, to avoid confirming the document's existence to
an unauthorized caller) if it doesn't match.

Also widened the ownership check in this method from `STUDENT`-only to
`STUDENT || FACULTY`, matching the equivalent check already used in
`getById()` — previously a faculty member could download another faculty
member's booking documents.

### 6. Hardcoded secrets in `application.properties`
JWT signing secret, DB password, and mail password were hardcoded plaintext
values committed to source control, with no environment-variable override
and no profile separation.
→ Changed to `${ENV_VAR:dev-default}` syntax (`JWT_SECRET`, `DB_URL`,
`DB_USERNAME`, `DB_PASSWORD`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`,
`MAIL_PASSWORD`, `JWT_EXPIRATION_MS`). Local `mvn spring-boot:run` keeps
working unmodified (defaults match the original values), but any real
deployment can now override every secret via environment variables instead
of editing source. Added an inline comment flagging that the default JWT
secret must be replaced before any non-local deployment.

---

## 🟡 Data / consistency

### 7. `database/schema.sql` and `database/init.sql` didn't match the entity model
The original SQL referenced a different (older?) design — e.g. `users.department`
instead of the entity's actual `department_name` column, and was missing the
`booking_objectives`, `booking_outcomes`, `booking_coordinators`,
`booking_faculty_supports`, and `booking_documents` tables that the current
`Booking`-related entities actually use. Since
`spring.jpa.hibernate.ddl-auto=update` drives the real runtime schema, these
files were pure (and misleading) documentation, not a configuration risk —
but anyone trying to set the DB up manually, or referencing the SQL for a
report, would get an inconsistent picture.
→ Regenerated both files directly from the current JPA entities/enums:
correct table and column names, FKs, CHECK constraints, indexes (including
the composite indexes that match the conflict-detection queries in
`BookingRepository`), two read-only convenience views
(`vw_active_resources`, `vw_pending_approvals`), and the same admin/
department seed data as before, with a clear comment explaining that
Hibernate generates the live schema and these files exist as accurate
reference/documentation.

### 8. Validation — booking time range only checked in the service layer
`BookingRequest` had no DTO-level guarantee that `endTime` is after
`startTime`; this was only caught later inside
`BookingValidationService`/`BookingService`.
→ Added a Bean Validation `@AssertTrue` cross-field check
(`isTimeRangeValid()`) directly on `BookingRequest`, so an invalid range now
fails fast as a normal 400 field-validation error from `@Valid` on the
controller, instead of surfacing only as a later business-rule exception.
The existing service-layer check is unaffected and still runs as defense in
depth.

### 9. Duplicate, dead `ProtectedRoute.jsx`
Identical component existed at both `components/ProtectedRoute.jsx` and
`components/common/ProtectedRoute.jsx`. `App.jsx` only ever imports the
`common/` copy; the top-level copy was unreferenced anywhere in the codebase
and additionally had a broken relative import (`'../../context/AuthContext'`
from `components/` resolves outside `src/`).
→ Removed the unused top-level copy. No import changes needed elsewhere
since nothing pointed at it.

---

## Not changed (reviewed, found acceptable for project scope)

- **OTP stored as plaintext** in `otp_verifications` — common and generally
  fine for short-lived (10 min), single-use, attempt-capped codes; flagged
  for awareness, not changed.
- **JWT stored in `localStorage`** on the frontend — standard tradeoff for a
  React SPA without a BFF; httpOnly cookies would be more XSS-resistant but
  are a larger architectural change outside the scope of a fix-pass.
- **No login-attempt brute-force lockout** (separate from the existing
  `isActive`/`LockedException` handling) — worth adding later, but no
  existing code path was broken by its absence.
- **`SecurityConfig`'s reliance on method-level `@PreAuthorize`** rather than
  exhaustive URL matchers — every controller method I reviewed does have a
  correct `@PreAuthorize`, so this is a "thinner than ideal defense-in-depth"
  note rather than a confirmed gap; left as-is to avoid introducing matcher
  rules that could drift out of sync with the controllers over time.

---

## Files touched

**Modified**
- `backend/src/main/java/com/smartcampus/service/AdminService.java`
- `backend/src/main/java/com/smartcampus/dto/CreateManagedUserRequest.java`
- `backend/src/main/java/com/smartcampus/service/BookingService.java`
- `backend/src/main/java/com/smartcampus/dto/booking/BookingRequest.java`
- `backend/src/main/resources/application.properties`
- `database/schema.sql`
- `database/init.sql`
- `frontend/src/api/bookingApi.js`

**Added**
- `backend/src/main/java/com/smartcampus/controller/UserController.java`
- `backend/src/main/java/com/smartcampus/dto/user/UserLookupResponse.java`

**Removed**
- `frontend/src/components/ProtectedRoute.jsx` (dead duplicate)

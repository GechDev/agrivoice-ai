# Security and Authentication

How AgriVoice authenticates actors, authorizes tenant data, hardens HTTP responses, and where residual risks remain.

Related documents: [Architecture.md](Architecture.md) · [Backend-Reference.md](Backend-Reference.md) · [Development-Testing-and-Operations.md](Development-Testing-and-Operations.md)

---

## 1. Identity modes

| Mode | Store | Session | Middleware |
| ---- | ----- | ------- | ---------- |
| Anonymous | — | — | none |
| Field agent | `agents` table | Custom `AgentSession` (scoped service) | `agent` |
| Laravel user | `users` + Fortify | Default web guard | `auth`, often `verified` |
| Cooperative admin | `cooperative_admins` | Same user session | `auth` + `verified` + `cooperative.admin` |

Agents are **not** `User` models. Mixing agent PIN auth with Fortify would be incorrect.

---

## 2. Agent authentication

**Files:** `AgentAuthController`, `AgentLoginRequest`, `AgentSession`, `EnsureAgentIsAuthenticated`, `Agent` model (`pin` hashed cast).

**Flow**

1. `GET /portal/login` shows seeded agent roster (names only).
2. `POST /portal/login` validates name + 4-digit PIN; throttled 10/min.
3. On success, agent id stored in session via `AgentSession`.
4. Protected routes call `agentOrFail()` after middleware.
5. Logout clears session key.

**Hardening choices**

- PIN never returned to client.
- Failed login should not leak whether the name exists (covered by portal auth tests).
- Report `agent_id` always from session inside `ReportEntryService`, never from form input.

**Limitations**

- Demo PINs are public fixtures (`1111`…`4444`).
- Seeder also creates an internal **Public Submission** agent with PIN `0000`. That name appears in the portal roster, so after seeding anyone can log in as that agent and submit **immediately verified** portal reports — bypassing the pending behavior of `/report-price`. Treat as demo-only risk; never run demo seeders in production.
- No lockout beyond throttle, no MFA, no recovery, no self-service signup.

---

## 3. Fortify user authentication

**Files:** `FortifyServiceProvider`, `config/fortify.php`, Fortify actions, auth pages under `resources/js/pages/auth/`, settings controllers.

**Capabilities**

- Registration, login, password reset, email verification UI, password confirmation, 2FA, passkeys (Laravel Passkeys package).
- Custom `App\Http\Responses\LoginResponse` for post-login routing (cooperative admins).
- Production password defaults: min 12, mixed case, letters, numbers, symbols, uncompromised (`AppServiceProvider`). Local/dev defaults are relaxed.

**Verification caveat**

- `User` does **not** implement `MustVerifyEmail`.
- Cooperative registration sets `email_verified_at` immediately.
- Therefore `verified` middleware is weak for demo users even though routes declare it.

---

## 4. Cooperative authorization

**Gatekeeping layers**

1. Must be logged-in user (`auth`).
2. `EnsureCooperativeAdmin` requires a `cooperative_admins` row and attaches that cooperative to the request.
3. Policies (`ReportPolicy`, `CooperativeMemberPolicy`, `SubscriptionPolicy`, `InvoicePolicy`) enforce **same-cooperative** ownership on model actions.
4. Services scope queries with `forCooperative($id)` / member attribution.

**Registration constraints**

- Email must be a Gmail address (`CooperativeRegisterRequest`).
- Creates Owner role admin + Starter subscription in a DB transaction.

**Tenant isolation tests**

Feature tests under `tests/Feature/Cooperative*Test.php` assert cross-tenant denial for dashboard, members, reports, prices, and billing.

---

## 5. Report moderation security

| Action | Authorization today |
| ------ | ------------------- |
| Cooperative status change | `UpdateReportStatusRequest` + `ReportPolicy::update` + transactional audit log |
| Flag on live list | `auth` + `verified` + throttle — **not** policy-scoped |
| Portal create | `agent` middleware; attribution server-side |
| Public create | throttle by IP; pending status so aggregates ignore until verified |

Flagging is irreversible in the product action (`FlagReport` idempotent set-true).

---

## 6. Validation and abuse controls

- Form requests centralize rules and authorization.
- Price inputs strip commas/spaces; bounds `> 0` and `< 100000`.
- Dates must be within the last year and not unrealistically future.
- Bulk invite: MIME allow-list, 5 MB max, server-side phone normalization, skip duplicates.
- Named rate limiters for public report and cooperative guest writes.
- CSRF protection via Laravel web middleware for browser posts.

---

## 7. HTTP security headers and CSP

**Middleware:** `app/Http/Middleware/SecurityHeaders.php`

Sets:

- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`: camera/microphone/geolocation/payment disabled
- `Content-Security-Policy` (see below)
- `Strict-Transport-Security` when request is secure or app is production

**CSP design**

- Default: first-party only; `object-src 'none'`; `frame-ancestors 'self'`.
- Images: self + data/blob + OpenStreetMap tile hosts (Leaflet).
- Fonts/styles: self + Bunny fonts; inline styles allowed for UI libraries.
- Scripts: self + inline; in non-production also exact Vite origins (`127.0.0.1:5173`, `localhost:5173`, `[::1]:5173`, plus `public/hot` URL) and `unsafe-eval` for Vite.
- **Never** use port wildcards like `127.0.0.1:*` — Chromium rejects them and CSS/JS silently fail (unstyled HTML symptom).

---

## 8. CORS

**Config:** `config/cors.php` + `.env.example` keys `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, `CORS_SUPPORTS_CREDENTIALS`.

- Paths are broad (`*`) but origins must be **explicit** — never `*`.
- Credentials supported when configured.
- Primary app traffic is same-origin Inertia; CORS matters for alternate frontends or tooling.

Covered by `tests/Feature/SecurityHardeningTest.php`.

---

## 9. Cookies, sessions, proxies

| Topic | Behavior |
| ----- | -------- |
| Session driver | `database` by default |
| Lifetime | 120 minutes (env) |
| Encrypt cookies | Yes, except `appearance`, `locale`, `sidebar_state` |
| SameSite | `lax` default |
| Secure cookie | Forced true in production when unset |
| Trust proxies | `*` for TLS-terminating platforms |
| HTTPS URLs | Forced in production (`URL::forceScheme`) |

---

## 10. Data protection notes

- Agent PINs and user passwords use hashed casts / Hash facade.
- Destructive Artisan DB commands prohibited in production.
- Invoice PDFs served only from local disk after policy `view` and existence check.
- No public REST dump of reports; data leaves via Inertia props, CSV/PDF downloads, or authenticated pages.
- Mailer defaults to `log` — invites are not emailed/SMS’d in the demo configuration.

---

## 11. Threat model highlights (honest)

| Risk | Mitigation | Residual |
| ---- | ---------- | -------- |
| Agent PIN guessing | Throttle; hashed PIN | Short PINs + public demo values |
| Cross-tenant coop data | Middleware + policies + scoped queries | Must keep using scopes in new code |
| Aggregate poisoning | Flag + status filters | Public pending excluded; agent entries auto-verified |
| IVR TTS cost abuse | `auth` + `verified`, validation, content-hash cache | No dedicated IVR rate limiter; demo users and weak verification can still generate many unique clips |
| External audio URL retrieval | Addis API response only, server-side download timeout | Service downloads the returned URL without an explicit host allowlist |
| Voice/chat privacy | STT/chat not exposed by routes today | If wired later, recordings/prompts leave the application for Addis AI |
| Clickjacking | `X-Frame-Options` / CSP frame-ancestors | — |
| XSS via CDN scripts | No chart CDNs; npm bundle | Inline script allowance for Inertia/Vite |
| Payment fraud | N/A — mock fields only | Do not collect real credentials |
| SMS invite leakage | Job only logs | Wire provider carefully later |
| Live-list flag abuse | Auth + throttle | Any logged-in user can flag any report |

---

## 12. Security-related tests

Primary suite: `tests/Feature/SecurityHardeningTest.php` (headers, CSP, CORS, throttles, auth boundaries).

Also: `CooperativeAuthTest`, `Portal/AgentAuthTest`, cooperative tenant tests, `ReportModerationTest`, `PublicReportTest`.

# Backend Reference

Inventory of routes, middleware, controllers, requests, actions, services, policies, resources, jobs, and rate limits. Paths are relative to `agrivoice/`.

Related documents: [Architecture.md](Architecture.md) · [Domain-and-Database.md](Domain-and-Database.md) · [Security-and-Authentication.md](Security-and-Authentication.md)

---

## 1. Global middleware stack

Configured in `bootstrap/app.php`. Every web request receives:

1. Laravel default web group (cookies, session, CSRF, etc.)
2. `HandleAppearance`
3. `SetLocale`
4. `HandleInertiaRequests`
5. `AddLinkHeadersForPreloadedAssets`
6. `SecurityHeaders`

**Aliases**

| Alias | Class | Behavior |
| ----- | ----- | -------- |
| `agent` | `EnsureAgentIsAuthenticated` | Requires `AgentSession` identity; redirect to portal login or 401 JSON |
| `cooperative.admin` | `EnsureCooperativeAdmin` | Requires authenticated user with `cooperative_admins` row; attaches cooperative to request |

**Health:** `GET /up`

---

## 2. Rate limiters

Defined in `AppServiceProvider::configureRateLimiting` and inline route middleware.

| Name / middleware | Limit | Key |
| ----------------- | ----- | --- |
| `public-report` | 10 / min | IP |
| `cooperative-login` | 5 / min | email\|IP |
| `cooperative-register` | 5 / min | IP |
| `throttle:10,1` on portal login | 10 / min | default |
| `throttle:30,1` on `POST /reports` | 30 / min | default |
| `throttle:20,1` on flag | 20 / min | default |
| `throttle:60,1` on language switch | 60 / min | default |
| `throttle:6,1` on password update | 6 / min | default |

---

## 3. Route catalog

### Public (`routes/web.php`)

| Method | Path | Name | Extra middleware | Handler |
| ------ | ---- | ---- | ---------------- | ------- |
| GET | `/` | `home` | — | Inertia `welcome` |
| GET | `/language/{locale}` | `language.switch` | `throttle:60,1` | Closure sets locale cookie |
| GET | `/dashboard` | `dashboard` | — | `DashboardController` |
| GET | `/reports` | `reports.index` | — | `ReportController@index` |
| GET | `/report-price` | `report-price` | — | `PublicReportController@create` |
| POST | `/report-price` | `report-price.store` | `throttle:public-report` | `PublicReportController@store` |

### Cooperative auth

| Method | Path | Name | Extra middleware | Handler |
| ------ | ---- | ---- | ---------------- | ------- |
| GET | `/cooperative/login` | `cooperative.login` | `guest` | `CooperativeAuthController@createLogin` |
| POST | `/cooperative/login` | `cooperative.login.store` | `guest`, `throttle:cooperative-login` | `login` |
| GET | `/cooperative/register` | `cooperative.register` | `guest` | `createRegister` |
| POST | `/cooperative/register` | `cooperative.register.store` | `guest`, `throttle:cooperative-register` | `register` |
| POST | `/cooperative/logout` | `cooperative.logout` | `auth` | `destroy` |

### Authenticated farmer + cooperative admin

Group: `auth`, `verified`. Cooperative subgroup also: `cooperative.admin`, prefix `/cooperative`, name prefix `cooperative.`.

| Method | Path | Name | Handler |
| ------ | ---- | ---- | ------- |
| POST | `/reports/{report}/flag` | `reports.flag` | `ReportController@flag` (+ throttle) |
| GET | `/ivr` | `ivr.index` | `IvrController@index` |
| POST | `/ivr/speak` | `ivr.speak` | `IvrController@speak` |
| GET | `/cooperative/dashboard` | `cooperative.dashboard` | `CooperativeDashboardController` |
| GET | `/cooperative/reports` | `cooperative.reports.index` | `CooperativeReportController@index` |
| GET | `/cooperative/reports/export` | `cooperative.reports.export` | `export` |
| PATCH | `/cooperative/reports/{report}/status` | `cooperative.reports.status` | `updateStatus` |
| GET | `/cooperative/prices` | `cooperative.prices.index` | `CooperativePriceController@index` |
| GET | `/cooperative/prices/download` | `cooperative.prices.download` | `download` |
| GET | `/cooperative/billing` | `cooperative.billing.index` | `CooperativeBillingController@index` |
| PATCH | `/cooperative/billing/subscriptions/{subscription}/plan` | `cooperative.billing.plan` | `updatePlan` |
| PATCH | `/cooperative/billing/subscriptions/{subscription}/payment-method` | `cooperative.billing.payment-method` | `updatePaymentMethod` |
| GET | `/cooperative/billing/invoices/{invoice}/download` | `cooperative.billing.invoices.download` | `downloadInvoice` |
| GET | `/cooperative/members` | `cooperative.members.index` | `CooperativeMemberController@index` |
| POST | `/cooperative/members` | `cooperative.members.store` | `store` |
| POST | `/cooperative/members/bulk-invite` | `cooperative.members.bulk-invite` | `bulkInvite` |
| GET | `/cooperative/members/{member}` | `cooperative.members.show` | `show` |
| PATCH | `/cooperative/members/{member}/remove` | `cooperative.members.remove` | `remove` |

### Portal (`routes/portal.php`)

| Method | Path | Name | Extra middleware | Handler |
| ------ | ---- | ---- | ---------------- | ------- |
| GET | `/portal/login` | `portal.login` | — | `AgentAuthController@create` |
| POST | `/portal/login` | `portal.login.store` | `throttle:10,1` | `store` |
| GET | `/portal` | `portal.entry` | `agent` | `ReportController@create` |
| POST | `/portal/logout` | `portal.logout` | `agent` | `AgentAuthController@destroy` |
| POST | `/reports` | `reports.store` | `agent`, `throttle:30,1` | `ReportController@store` |

### Settings (`routes/settings.php`)

| Method | Path | Name | Notes |
| ------ | ---- | ---- | ----- |
| ANY | `/settings` | — | Redirect → profile |
| GET/PATCH/DELETE | `/settings/profile` | `profile.*` | ProfileController |
| GET | `/settings/security` | `security.edit` | password confirmation middleware |
| PUT | `/settings/password` | `user-password.update` | throttled |
| GET | `/settings/appearance` | `appearance.edit` | Inertia page |
| GET | `/.well-known/passkey-endpoints` | `well-known.passkeys` | Passkey discovery |

Fortify also registers its own auth routes (login, register, 2FA, etc.) via `FortifyServiceProvider`.

---

## 4. Controllers (domain)

| Controller | Path | Responsibility |
| ---------- | ---- | -------------- |
| `DashboardController` | `app/Http/Controllers/DashboardController.php` | Snapshots + market markers |
| `ReportController` | … | Live list, portal form, store, flag |
| `PublicReportController` | … | Guest submission |
| `IvrController` | … | Authenticated IVR page props + Addis TTS JSON endpoint |
| `AgentAuthController` | … | Agent PIN login/logout |
| `CooperativeAuthController` | … | Coop login/register/logout |
| `CooperativeDashboardController` | … | Coop overview props |
| `CooperativeReportController` | … | Index/export/status |
| `CooperativePriceController` | … | Summary + PDF |
| `CooperativeMemberController` | … | Roster CRUD-ish flows |
| `CooperativeBillingController` | … | Subscription UI + mock payment |
| `CooperativeController` | … | Base helper to resolve cooperative from request |
| `Settings\ProfileController` | … | Profile |
| `Settings\SecurityController` | … | Password / security page |

---

## 5. Form requests

| Request | Key rules |
| ------- | --------- |
| `AgentLoginRequest` | name; PIN exactly 4 digits |
| `StoreReportRequest` | crop, market slug, price >0 & <100000 (commas stripped), reporter_type, reported_at within ~1 year / not future |
| `StorePublicReportRequest` | crop, market, price, reported_at (no reporter_type) |
| `IvrSpeakRequest` | Required bounded Amharic text for TTS |
| `CooperativeLoginRequest` | email, password, optional remember |
| `CooperativeRegisterRequest` | name, unique **Gmail** email, password confirmed, cooperative_name, region |
| `CooperativeReportFilterRequest` | optional crop/market/status/from/to; authorizes `Report::viewAny` |
| `UpdateReportStatusRequest` | status; reason required for disputed/rejected; no-op rejected; authorizes update |
| `InviteMemberRequest` | Ethiopian phone unique per coop; optional name |
| `BulkInviteMembersRequest` | CSV/TXT ≤5MB |
| `UpdateSubscriptionPlanRequest` | valid `PlanTier` |
| `UpdatePaymentMethodRequest` | type ∈ Telebirr / Bank transfer / Chapa test; 4-digit last_four |
| `Settings\*` | profile/password/delete/2FA helpers |

---

## 6. Actions

| Action | Path | Behavior |
| ------ | ---- | -------- |
| `RegisterCooperative` | `app/Actions/RegisterCooperative.php` | Transaction: coop + user + owner admin + Starter subscription |
| `InviteCooperativeMember` | … | Create invited member; dispatch invite job after commit |
| `BulkInviteCooperativeMembers` | … | Stream CSV, normalize phones, chunk insert, dispatch jobs |
| `ChangeReportStatus` | … | Lock row, update status, write `ReportStatusLog` |
| `FlagReport` | … | Idempotent `is_flagged = true` |
| `Fortify\CreateNewUser` | … | Standard registration |
| `Fortify\ResetUserPassword` | … | Password reset |

---

## 7. Services

| Service | Public API highlights |
| ------- | --------------------- |
| `SnapshotService` | `all()`, `forCropMarket()`, `weightedPrice()`, `confidence()` |
| `PredictionService` | `trend()`, `trendFromReports()` |
| `ReportEntryService` | `record($data, Agent)` — portal persistence |
| `AgentSession` | login/logout/current agent for request |
| `AddisAiVoiceService` | Addis TTS/estimate plus currently unrouted STT/chat methods |
| `IvrAudioCatalog` | Fixed IVR clip catalog and public URLs |
| `IvrScriptBuilder` | Amharic menu/live-price script construction |
| `AmharicNumberSpeech` | Integer to Amharic words |
| `CooperativeDashboardService` | `cooperativePayload`, `prices`, `memberActivity`, `trends` |
| `CooperativeReportsService` | `pagePayload`, `filteredQuery`, `exportCsv` |
| `CooperativePriceService` | `summary()` |
| `CooperativeMembersService` | `pagePayload`, `memberDetail`, filters |

---

## 8. Policies

| Policy | Gates |
| ------ | ----- |
| `ReportPolicy` | `viewAny` any coop admin; `view`/`update` only reports with member in same cooperative |
| `CooperativeMemberPolicy` | `viewAny`/`create`; `view` same coop; `remove` same coop and not already removed |
| `SubscriptionPolicy` | `viewAny`; `view`/`update` same coop |
| `InvoicePolicy` | `viewAny`; `view` same coop |

**Note:** Live-list `reports.flag` currently relies on `auth`+`verified` only, not `ReportPolicy`.

---

## 9. HTTP resources

| Resource | Shape (camelCase props) |
| -------- | ----------------------- |
| `ReportResource` | id, crop, market, price, reportedAt, source←reporter_type, agentName, isFlagged, createdAt |
| `PriceSnapshotResource` | crop, market, price, confidence, reportCount, lastUpdated, trend, changePercent |
| `MarketResource` | slug, name, region, latitude, longitude |

Cooperative pages often return **inline arrays** from services instead of API Resources.

---

## 10. Jobs

| Job | Path | Behavior |
| --- | ---- | -------- |
| `SendMemberInviteJob` | `app/Jobs/SendMemberInviteJob.php` | 3 tries, backoff; loads member and **logs** intended invite — no SMS provider |

Default `QUEUE_CONNECTION=sync` runs jobs inline for demos.

---

## 11. Controller → Inertia page map

| Controller method | Inertia page |
| ----------------- | ------------ |
| home route | `welcome` |
| DashboardController | `dashboard` |
| ReportController@index | `reports` |
| ReportController@create | `portal/entry` |
| PublicReportController@create | `report-price` |
| AgentAuthController@create | `portal/login` |
| CooperativeAuthController login/register | `Cooperative/auth/login`, `Cooperative/auth/register` |
| CooperativeDashboardController | `Cooperative/Dashboard` |
| CooperativeReportController@index | `Cooperative/Reports/Index` |
| CooperativePriceController@index | `Cooperative/Prices/Index` |
| CooperativeMemberController@index | `Cooperative/Members/Index` |
| CooperativeBillingController@index | `Cooperative/Billing/Index` |
| Settings | `settings/profile`, `settings/security`, `settings/appearance` |
| IvrController@index | `ivr` |

---

## 12. Important write-side contracts

### `POST /reports` (agent)

- Body: crop, market, price, reporter_type, reported_at
- Side effects: verified report, `source=agent_portal`, session `agent_id`
- Response: redirect back with flash / Inertia success handling

### `POST /report-price`

- Body: crop, market, price, reported_at
- Side effects: pending crowd report, `source=public_web`, Public Submission agent
- Response: redirect to `report-price`

### `PATCH …/reports/{report}/status`

- Body: status, reason (required for dispute/reject)
- Side effects: transactional status + audit log
- Policy: cooperative-scoped member reports only

### Billing plan change

- Sets `pending_plan_tier` only — no charge, no immediate tier swap of limits/price until a future processor exists.

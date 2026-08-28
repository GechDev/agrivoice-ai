# Development, Testing, and Operations

Setup, environment, scripts, tests, deployment assumptions, and troubleshooting.

Related documents: [Documentation.md](Documentation.md) · [Security-and-Authentication.md](Security-and-Authentication.md) · [Architecture.md](Architecture.md)

Paths below are relative to the Laravel app root: `agrivoice/`.

---

## 1. Prerequisites

- PHP ^8.3
- Composer
- Node.js + npm
- SQLite (default) or another Laravel-supported database
- Optional: queue worker if `QUEUE_CONNECTION` is not `sync`

---

## 2. Quick start (demo-ready)

```bash
cd agrivoice
composer run setup
php artisan migrate:fresh --seed
composer run dev
```

Open **http://127.0.0.1:8000** (prefer IPv4 over `localhost` so PHP and Vite stay aligned).

Step-by-step equivalent:

```bash
cp .env.example .env
composer install
php artisan key:generate
touch database/database.sqlite   # if using SQLite file
php artisan migrate:fresh --seed
npm install
npm run build                    # or rely on Vite via composer run dev
composer run dev
```

`migrate:fresh --seed` builds a full showcase database. Do **not** live-fetch external market APIs during demos — all showcase data is local.

---

## 3. Demo credentials

| Surface | URL | Credentials |
| ------- | --- | ----------- |
| Agent portal | `/portal/login` | Tsegaye/`1111`, Gezachew/`2222`, Nati/`3333`, Nba/`4444` |
| Internal public agent (seeded) | `/portal/login` | `Public Submission` / `0000` (demo risk — submits verified reports) |
| Cooperative | `/cooperative/login` | `coop.owner@gmail.com` / `password` |
| Farmer/moderator | `/login` | `test@example.com` / `password` |

Never run `migrate:fresh --seed` (or the default demo seeders) against a production database.

---

## 4. Environment variables

Authoritative template: [`.env.example`](../.env.example).

| Variable | Purpose |
| -------- | ------- |
| `APP_NAME` | Defaults to AgriVoice |
| `APP_ENV` / `APP_DEBUG` / `APP_KEY` / `APP_URL` | Core app identity — use `https://…` in production |
| `FRONTEND_URL` | CORS companion to app URL |
| `CORS_ALLOWED_ORIGINS` | Extra explicit origins (comma-separated); never `*` |
| `CORS_SUPPORTS_CREDENTIALS` | Default true |
| `APP_LOCALE` / `APP_FALLBACK_LOCALE` | `en` default |
| `DB_CONNECTION` | `sqlite` default |
| `SESSION_DRIVER` | `database` default |
| `SESSION_SECURE_COOKIE` | Auto-true in production when null |
| `QUEUE_CONNECTION` | `sync` for zero-config demos; use `database` + worker for async invites |
| `CACHE_STORE` | `database` default |
| `MAIL_MAILER` | `log` default (no real email) |
| `VITE_APP_NAME` | Frontend title helper |
| `ADDIS_AI_API_KEY` | Server-side Addis AI credential for IVR TTS |
| `ADDIS_AI_VOICE_ID` | Amharic voice id; default `am-hamen` |

---

## 5. Composer scripts

From [`composer.json`](../composer.json):

| Script | What it runs |
| ------ | ------------ |
| `composer setup` | install, ensure `.env`, key:generate, migrate, npm install, npm build — create `database/database.sqlite` first when using SQLite |
| `composer run dev` | `php artisan dev` (concurrent app + Vite tooling) |
| `composer lint` | Pint `--parallel` |
| `composer lint:check` | Pint `--test` |
| `composer types:check` | PHPStan via Larastan |
| `composer test` | config:clear + lint:check + types:check + `php artisan test` |
| `composer ci:check` | npm lint/format/types checks + composer test |

---

## 6. npm scripts

From [`package.json`](../package.json):

| Script | Purpose |
| ------ | ------- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production assets → `public/build` |
| `npm run build:ssr` | Client + SSR builds |
| `npm run format` / `format:check` | Prettier on `resources/` |
| `npm run lint` / `lint:check` | ESLint |
| `npm run types:check` | `tsc --noEmit` |

**Known caveat:** `npm run lint` may fail on a toolchain/config mismatch (`eslint` 10 vs `@eslint/js` recommended export). Prefer `npm run types:check` and Prettier for frontend verification until ESLint config is upgraded. PHP linting via Pint remains the server-side formatter.

At audit baseline `fb69b7f`, `npm run types:check` also fails in the currently
unmounted `components/landing/nav.tsx`: its navigation item `href` union can be
a Wayfinder `RouteDefinition`, while React `key` and native `<a href>` require
primitive strings. The rendered landing uses navigation embedded in
`landing/hero.tsx`, so this does not block that page at runtime, but CI remains
red until the unused component is fixed or removed.

---

## 7. Vite / loopback notes

- Vite is pinned to `127.0.0.1:5173` (`vite.config.ts`).
- `AppServiceProvider` pins `artisan serve` to `127.0.0.1:8000`.
- CSP allows exact Vite origins in non-production (see Security docs).
- Symptom of misaligned host/CSP: page looks like unstyled raw HTML → run `composer run dev` or `npm run build`, hard-refresh, ensure URL uses `127.0.0.1`.

---

## 8. Testing

### Runner

- Pest (`tests/Pest.php`) over PHPUnit config [`phpunit.xml`](../phpunit.xml)
- In-memory SQLite, array cache/session/mail, sync queue, `APP_ENV=testing`

```bash
php artisan test --compact
# or
composer test
```

### Feature coverage map

| Area | Tests |
| ---- | ----- |
| Dashboard / snapshots | `Feature/DashboardTest.php`, `Feature/DashboardSnapshotTest.php`, `Unit/SnapshotServiceTest.php` |
| Live list / flagging | `Feature/ReportModerationTest.php` |
| Public report | `Feature/PublicReportTest.php` |
| Portal auth + store + seed | `Feature/Portal/AgentAuthTest.php`, `StoreReportTest.php`, `DemoSeedTest.php` |
| Cooperative auth/demo | `Feature/CooperativeAuthTest.php`, `CooperativeDemoSeedTest.php` |
| Cooperative domains | `CooperativeDashboardTest`, `MembersTest`, `ReportsTest`, `PricesTest`, `BillingTest` |
| Security hardening | `Feature/SecurityHardeningTest.php` |
| IVR / Amharic speech | `Feature/IvrTest.php`, `Unit/AmharicNumberSpeechTest.php` |
| WFP history import | `Feature/WfpFoodPricesSeederTest.php` |
| Fortify/settings | `Feature/Auth/*`, `Feature/Settings/*` |

### Gaps

- No React component unit tests or browser/Dusk suite in-repo.
- DomPDF (`barryvdh/laravel-dompdf`) must be present in `vendor` for cooperative PDF download tests; a missing install surfaces as a class-not-found failure on the price PDF route.
- Prediction seeding is optional; tests that need predictions create their own data.
- CI is primarily backend `composer ci:check`; no browser matrix, coverage gate, or production-config smoke is required by default.
- GitHub Actions workflow currently lives at `agrivoice/.github/workflows/tests.yml`. GitHub only discovers workflows at the repository-root `.github/workflows/`, so this nested path is inactive until moved and given `working-directory: agrivoice`.
- `verified` middleware is weak because `User` does not implement `MustVerifyEmail` (see Security doc).

---

## 9. Seeders and factories

- Root: `database/seeders/DatabaseSeeder.php`
- Domain factories under `database/factories/*`
- Details: [Domain-and-Database.md](Domain-and-Database.md)
- Optional WFP history: `php artisan db:seed --class=WfpFoodPricesSeeder`

Re-seed:

```bash
php artisan migrate:fresh --seed
```

---

## 10. Deployment checklist

1. Set `APP_ENV=production`, `APP_DEBUG=false`, strong `APP_KEY`.
2. Set `APP_URL=https://your-domain` (HTTPS forced in production).
3. Configure durable database (not ephemeral SQLite file on ephemeral disks).
4. Set explicit `CORS_ALLOWED_ORIGINS` if a separate frontend origin exists.
5. `SESSION_SECURE_COOKIE=true` (or leave null to auto-enable in production).
6. `npm run build` and deploy `public/build` artifacts.
7. Run migrations (`php artisan migrate --force`).
8. Seed only if you intentionally want demo data (usually **not** in production).
9. If invites should be async: `QUEUE_CONNECTION=database` + `php artisan queue:work`.
10. Configure real mail/SMS before treating invite jobs as user-facing.
11. Health: `GET /up`.
12. Confirm CSP still allows OSM tiles if the map is used; do not widen script-src casually.
13. Replace mock billing before accepting real payment details.
14. For IVR TTS, set `ADDIS_AI_API_KEY`, run `php artisan storage:link`, and optionally pre-generate fixed clips with `php artisan ivr:generate-audio --yes`.
15. Treat WFP CSV rows as historical external data; import explicitly rather than through production default seeding.

Trust proxies are already enabled for common PaaS TLS termination.

---

## 11. Operational assumptions

| Concern | Demo default | Production recommendation |
| ------- | ------------ | ------------------------- |
| Queue | `sync` | `database`/`redis` + worker |
| Mail | `log` | Real SMTP/API |
| SMS invites | Log-only job | Provider integration |
| Billing | Mock fields | Payment provider + webhooks |
| Cache | database | redis for multi-node |
| Voice | Simulated UI | External STT/TTS if pursued |

---

## 12. Troubleshooting

| Symptom | Likely cause | Fix |
| ------- | ------------ | --- |
| Unstyled HTML | Vite down or CSP blocking `:5173` | `composer run dev`; use `127.0.0.1`; or `npm run build` |
| Cooperative login 500 / blank page | Inertia page name mismatch | Pages live under `Cooperative/auth/*` (capital C) |
| Dashboard never moves | No verified reports / all flagged | Re-seed; check status/flags |
| Public report not on tiles | Status `pending` | Verify via cooperative moderation |
| Invite “sent” but no SMS | Expected | Job logs only |
| Invoice download 404 | No `pdf_path` file | Seed/upload PDF or expect unavailable |
| ESLint crashes | Toolchain mismatch | Use `types:check` / Prettier; fix eslint config separately |
| Cross-origin asset issues | `localhost` vs `127.0.0.1` | Standardize on IPv4 loopback |

---

## 13. Repository documentation layout

Application docs live in `agrivoice/DOCS/`.

Repo-root `DOCS/` (sibling of `agrivoice/`) contains team process docs such as commit and testing rules (`CommitRule.md`, `TestingRule.md`, `ProgrammingRulle.md`) — complementary, not product architecture docs.

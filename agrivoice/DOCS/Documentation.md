# AgriVoice — Technical Documentation

Each functionality slice documents its own contract here. Sections are additive,
so add yours below rather than reshaping someone else's.

---

# Data-Entry Portal (owner: Gezachew)

Where crowd data enters the system. An agent signs in with a name and a PIN,
enters the price a farmer was offered, and that report flows to the live list and
the dashboard.

## Setup

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
composer run dev
```

The portal lives at `/portal/login`. `migrate:fresh --seed` yields a
demo-ready database — never live-fetch data during judging.

## Shared schema

Gezachew owns these migrations. Tsegaye's snapshot engine and Nati's feed both
read `reports`, so treat its columns as a frozen contract.

### `agents`

| Column       | Type      | Notes                                  |
| ------------ | --------- | -------------------------------------- |
| `id`         | id        |                                        |
| `name`       | string    | Unique — agents sign in by name        |
| `pin`        | string    | Hashed via the model's `hashed` cast   |
| timestamps   |           |                                        |

### `markets`

| Column      | Type          | Notes                                |
| ----------- | ------------- | ------------------------------------ |
| `id`        | id            |                                      |
| `slug`      | string        | Unique: `adama`, `addis_ababa`, `jimma` |
| `name`      | string        |                                      |
| `region`    | string        |                                      |
| `latitude`  | decimal(10,7) | For the dashboard map                |
| `longitude` | decimal(10,7) | For the dashboard map                |

### `reports`

| Column          | Type          | Notes                                                    |
| --------------- | ------------- | -------------------------------------------------------- |
| `id`            | id            |                                                          |
| `crop`          | string        | `teff` \| `coffee` \| `maize` \| `wheat` \| `sesame` \| `pulses` \| `sorghum` — cast to `App\Enums\Crop` |
| `market_id`     | FK → markets  |                                                          |
| `price`         | decimal(10,2) | ETB per quintal                                          |
| `reporter_type` | string        | `official` \| `crowd` — cast to `App\Enums\ReporterType`  |
| `source`        | string, null  | Provenance: `agent_portal`, `wfp`, `ecx`, `farmer`        |
| `agent_id`      | FK → agents   | Attribution — stamped from the session, never from a form |
| `reported_at`   | timestamp     | When the sale was observed, not when it was typed         |
| `is_flagged`    | bool          | Default false; excluded from every aggregate             |
| timestamps      |               |                                                          |

Indexed on `(crop, market_id, reported_at)` because the snapshot query hits that
combination constantly, and on `is_flagged`.

A displayed price is a **derived aggregate over `reports`**, not a stored column.
`Report::notFlagged()` is the shared scope for excluding flagged rows.

## Endpoints

| Method | Path            | Name                | Notes                                        |
| ------ | --------------- | ------------------- | -------------------------------------------- |
| GET    | `/portal/login` | `portal.login`      | Sign-in screen; sends the seeded agent roster |
| POST   | `/portal/login` | `portal.login.store` | Name + PIN; throttled to 10/min              |
| POST   | `/portal/logout`| `portal.logout`     | Clears the agent from the session             |
| GET    | `/portal`       | `portal.entry`      | Entry form + the agent's own recent entries   |
| POST   | `/reports`      | `reports.store`     | Validates, stamps `agent_id`, saves           |

Routes behind the `agent` middleware alias require a signed-in agent. Browser
visits are redirected to the sign-in screen; API clients get a 401.

### `POST /reports`

| Field           | Rules                                                  |
| --------------- | ------------------------------------------------------ |
| `crop`          | required, `teff` \| `coffee` \| `maize` \| `wheat` \| `sesame` \| `pulses` \| `sorghum` |
| `market`        | required, `adama` \| `addis_ababa` \| `jimma` (slug)     |
| `price`         | required, numeric, `> 0`, `< 100000`. `8,500` is accepted |
| `reporter_type` | required, `official` \| `crowd`                          |
| `reported_at`   | required date, within the last year, not in the future   |

Anything else is rejected with a 422 and a plain-language message. `agent_id`
comes from the session — a matching form field is ignored.

A same-day report is stored with the current clock time so a burst of entries
still sorts by recency; a backdated one is stored at the start of that day.

## Field-name mapping

Columns are snake_case; the React types are camelCase. `ReportResource` maps
between them, and `resources/js/types/agrivoice.ts` holds the TypeScript shapes.
`ReportRowData.source` carries `reporter_type` — that is the agreed contract with
the live list. If you rename a column, update both.

## Seeded demo data

`ReportSeeder` pulls in `AgentSeeder` and `MarketSeeder`, then derives — never
randomises — a fortnight of history so re-seeding is reproducible:

- 4 agents, 3 markets, seeded reports across all 21 crop-and-market pairs.
- Uneven coverage (14 reports down to 2) so confidence visibly varies.
- Mixed `official`/`crowd` with a gentle upward drift, so trends compute.
- Two obvious, deliberately **unflagged** outliers for the flag-outlier demo.

Demo PINs — fixtures, not credentials, since there is no sign-up screen:

| Agent    | PIN  |
| -------- | ---- |
| Tsegaye  | 1111 |
| Gezachew | 2222 |
| Nati     | 3333 |
| Nba      | 4444 |

## Reusable pieces

- `resources/js/components/reports/report-row.tsx` — the shared report row. It
  takes an `action` slot, which is where the live list's flag button goes, and an
  `isNew` flag that briefly highlights an arriving row.
- `resources/js/lib/agrivoice.ts` — crop/market labels, price and time
  formatting. Import these rather than re-deriving labels.
- `App\Services\AgentSession` — the signed-in agent. Use `agentOrFail()` behind
  the `agent` middleware.

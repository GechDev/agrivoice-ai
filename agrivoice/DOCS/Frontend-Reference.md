# Frontend Reference

React 19 + Inertia 3 + TypeScript UI surface. Paths relative to `agrivoice/`.

Related documents: [Architecture.md](Architecture.md) · [Features-and-Flows.md](Features-and-Flows.md) · [Documentation.md](Documentation.md)

---

## 1. Entry and tooling

| Item | Path / command |
| ---- | -------------- |
| JS entry | `resources/js/app.tsx` |
| CSS entry | `resources/css/app.css` |
| Blade root | `resources/views/app.blade.php` |
| Vite config | `vite.config.ts` (host `127.0.0.1:5173`) |
| Types | `resources/js/types/*` |
| Domain helpers | `resources/js/lib/agrivoice.ts` |
| Dev | `npm run dev` or `composer run dev` |
| Build | `npm run build` |
| Typecheck | `npm run types:check` |

Wayfinder generates typed helpers under `resources/js/routes` and `resources/js/actions` at build/dev time.

---

## 2. Layout resolution (`app.tsx`)

| Page name pattern | Layout |
| ----------------- | ------ |
| `welcome`, `report-price` | none |
| `portal/*` | none (`portal/entry` self-wraps `portal-layout`) |
| `auth/*`, `Cooperative/auth/*` | `AuthLayout` → `layouts/auth/auth-simple-layout.tsx` |
| `settings/*` | `[AppLayout, SettingsLayout]` |
| default | `AppLayout` → `layouts/app/app-sidebar-layout.tsx` |

Global chrome outside pages: `TooltipProvider`, Sonner `Toaster`, progress bar color leaf-green `oklch(0.42 0.13 145)`, title suffix `AgriVoice`.

---

## 3. Page inventory

### Public

| Inertia name | File | Notes |
| ------------ | ---- | ----- |
| `welcome` | `pages/welcome.tsx` | Composes landing sections |
| `dashboard` | `pages/dashboard.tsx` | Polls snapshots 2.5s |
| `reports` | `pages/reports.tsx` | Polls reports 2.5s; client filters |
| `report-price` | `pages/report-price.tsx` | Guest submission + success dialog |
| `ivr` | `pages/ivr.tsx` | Authenticated Amharic keypad + audio queue/TTS |

### Portal

| Inertia name | File | Notes |
| ------------ | ---- | ----- |
| `portal/login` | `pages/portal/login.tsx` | Split brand panel + PIN form |
| `portal/entry` | `pages/portal/entry.tsx` | Report form + recent entries |

### Auth (Fortify)

| Inertia name | File |
| ------------ | ---- |
| `auth/login` | `pages/auth/login.tsx` |
| `auth/register` | `pages/auth/register.tsx` |
| `auth/forgot-password` | `pages/auth/forgot-password.tsx` |
| `auth/reset-password` | `pages/auth/reset-password.tsx` |
| `auth/verify-email` | `pages/auth/verify-email.tsx` |
| `auth/confirm-password` | `pages/auth/confirm-password.tsx` |
| `auth/two-factor-challenge` | `pages/auth/two-factor-challenge.tsx` |

### Cooperative

| Inertia name | File |
| ------------ | ---- |
| `Cooperative/auth/login` | `pages/Cooperative/auth/login.tsx` |
| `Cooperative/auth/register` | `pages/Cooperative/auth/register.tsx` |
| `Cooperative/Dashboard` | `pages/Cooperative/Dashboard.tsx` |
| `Cooperative/Members/Index` | `pages/Cooperative/Members/Index.tsx` |
| `Cooperative/Reports/Index` | `pages/Cooperative/Reports/Index.tsx` |
| `Cooperative/Prices/Index` | `pages/Cooperative/Prices/Index.tsx` |
| `Cooperative/Billing/Index` | `pages/Cooperative/Billing/Index.tsx` |

### Settings

| Inertia name | File |
| ------------ | ---- |
| `settings/profile` | `pages/settings/profile.tsx` |
| `settings/security` | `pages/settings/security.tsx` |
| `settings/appearance` | `pages/settings/appearance.tsx` |

---

## 4. Component map by domain

### Landing (`components/landing/`)

The current rendered composition in `pages/welcome.tsx` is:

`hero` → `services` → `practical` → `story` → `testimonials` → `cta` → `footer`.

`nav`, `stats-bar`, `product-showcase`, `business-model`, and `constants` also exist but are not composed by the current welcome page. The previous `problem`, `solution`, `how-it-works`, `why-voice`, `demo`, `vision`, `trust`, and `faq` components were removed in the latest landing overhaul.

Current landing images are local under `public/images/landing/`. `constants.ts` still contains external Unsplash/Pexels/YouTube URLs used only by components that are not currently mounted.

### Live market

| Component | Role |
| --------- | ---- |
| `price-card.tsx` | Snapshot tile + flash on change |
| `market-map.tsx` | Leaflet markers/popups |
| `trend-chart.tsx` | Trend visualization |
| `recent-reports-feed.tsx` | Feed wrapper |
| `report-row.tsx` | Tabular live-list row + flag action |
| `reports/report-row.tsx` | Card-style portal recent entry |

### Portal

`portal/report-form.tsx`, `portal/choice-group.tsx`.

### IVR

`components/ivr-keypad.tsx` — five-key accessible button group plus physical key listener. `pages/ivr.tsx` queues fixed clips, requests dynamic TTS, and plays browser audio.

### Cooperative

Members: `members-table`, `members-filters`, `members-pagination`, `member-detail-sheet`, `member-status-badge`, `invite-member-dialog`, `bulk-invite-dialog`, `remove-member-dialog`.

Reports: `reports-table`, `reports-filters`, `reports-pagination`, `report-status-badge`, `report-audit-trail`, `update-report-status-dialog`.

Prices: `price-table`, `price-summary-cards`.

### Shared product UI

| Component | Role |
| --------- | ---- |
| `page-header.tsx` | Title/description/actions; inverse tone for live dashboard |
| `table-pagination.tsx` | Shared pager chrome |
| `status-badge.tsx` | Tone tokens for statuses |
| `app-logo.tsx` / `app-logo-icon.tsx` | Brand mark (always “AgriVoice”) |
| `app-sidebar.tsx` | Farmer/coop navigation |
| `language-switcher.tsx` | Locale cookie via route |
| `appearance-toggle.tsx` | Theme toggle |
| `motion/animate-in.tsx` | Scroll reveal |
| `motion/page-section.tsx` | Staggered page sections |
| `ui/*` | shadcn/Radix primitives (button, dialog, select, sidebar, textarea, …) |

---

## 5. TypeScript contracts

| File | Contents |
| ---- | -------- |
| `types/agrivoice.ts` | Crop, MarketSlug, Trend, ReporterType, PriceSnapshot, MarketMarker, ReportRowData, AgentSummary |
| `types/cooperative-reports.ts` | Report rows, filters, audit trail, pagination |
| `types/cooperative-prices.ts` | Price summary/rows/trends |
| `types/cooperative-members.ts` | Member rows, detail, bulk invite summary |
| `types/cooperative-billing.ts` | Subscription, plans, invoices |
| `types/auth.ts` | User, passkeys, 2FA |
| `types/navigation.ts` | Breadcrumbs, nav items |
| `types/ui.ts` | Flash, layout props |
| `types/global.d.ts` | Shared Inertia props augmentation |

Field naming: backend resources expose **camelCase** to match these types. `ReportRowData.source` carries **reporter type** (`official`/`crowd`), not the DB `source` provenance string — historical contract with the live list.

---

## 6. Hooks

| Hook | Path | Role |
| ---- | ---- | ---- |
| `useTranslations` | `hooks/use-translations.ts` | Dictionary lookup + `:placeholder` |
| `use-flash-toast` | `hooks/use-flash-toast.ts` | Flash → Sonner (incl. initial page load) |
| `use-appearance` | `hooks/use-appearance.tsx` | Theme + cookie/localStorage |
| `use-two-factor-auth` | `hooks/use-two-factor-auth.ts` | 2FA setup data |
| `use-current-url` | `hooks/use-current-url.ts` | Active nav matching |
| `use-mobile` | `hooks/use-mobile.tsx` | `<768px` |
| `use-clipboard` | `hooks/use-clipboard.ts` | Clipboard helper |
| `use-initials` | `hooks/use-initials.tsx` | Avatar initials |

---

## 7. Polling and client timers

| Location | Interval | Behavior |
| -------- | -------- | -------- |
| `pages/dashboard.tsx` | 2500 ms | `usePoll` only `snapshots`, `mode: 'rest'`, `keepAlive` |
| `pages/reports.tsx` | 2500 ms | `usePoll` only `reports`, same options |
| `landing/demo.tsx` | ~2200 ms steps | Simulated demo only |
| `Members/Index.tsx` | debounce | Search |
| `price-card` / `report-row` | ~0.9–1.6 s | Visual flash animations |

Portal entry does **not** poll; it refreshes after successful submits.

---

## 8. Design system

Defined in `resources/css/app.css`:

- Semantic tokens: `--background`, `--foreground`, `--primary` (leaf green), `--muted`, `--destructive`, `--sidebar-*`, chart colors.
- Dark mode via class/appearance pipeline.
- Animation utilities + `tw-animate-css` import.
- Prefer tokens over ad-hoc `emerald-*` / `zinc-*` (polish pass aligned badges/headers to primary/foreground).

Brand assets:

- `resources/js/assets/logo.png` (bundled mark)
- `public/logo.png`, `public/favicon.svg`, `public/favicon-32.png`, `public/apple-touch-icon.png`

---

## 9. Localization

1. Server middleware `SetLocale` reads cookie `locale` ∈ {`en`,`am`,`om`}.
2. `HandleInertiaRequests` loads `lang/{locale}.json` into `translations`.
3. Components call `const t = useTranslations(); t('Key')`.
4. Missing keys fall back to the key string itself.
5. `LanguageSwitcher` hits `language.switch` route (full visit + forever cookie).

Dictionaries: `lang/en.json`, `lang/am.json`, `lang/om.json` (kept in sync by key).

Limitations: no ICU plural rules; placeholders are simple `:name` replacements.

---

## 10. Forms and Wayfinder

Typical patterns:

- Inertia `useForm` / `<Form>` with Wayfinder `.form()` / `.url()` helpers.
- Cooperative filters use `router.get` with `preserveState` / `preserveScroll` / `replace`.
- Toasts from shared flash (`success`, `error`, `bulkInviteSummary`).

Validation errors surface via Inertia `errors` props and `InputError` components.

---

## 11. Charts and maps

| Feature | Library | Notes |
| ------- | ------- | ----- |
| Farmer trend chart | Recharts | Bundled; no CDN |
| Cooperative dashboard trends | Recharts LineChart | Actual vs forecast series |
| Market map | Leaflet + OSM tiles | `scrollWheelZoom: false`; marker icon Vite fix; CSP allows OSM tile hosts |

---

## 12. Frontend-only / mock UI

| UI | Reality |
| -- | ------- |
| Voice claims on landing | Landing links to prices; actual voice surface is authenticated `/ivr`, not a telephone channel |
| Billing payment method dialog | Stores display fields; labeled mock |
| Vision roadmap list | Marketing content |

---

## 13. Accessibility and UX conventions

- Semantic headers via `PageHeader`.
- Status badges expose `aria-label` where wrapped.
- Dialogs use Radix focus management.
- Motion respects reduced-motion CSS.
- Tables provide responsive overflow; pagination has previous/next aria labels.
- Agent and public pages include language + appearance controls without requiring login.

---

## 14. Sidebar navigation (authenticated shell)

`components/app-sidebar.tsx` exposes farmer destinations (dashboard, live list, settings) and, for cooperative admins, cooperative destinations (dashboard, members, reports, prices, billing). Exact visibility follows auth + admin linkage from shared `auth.user` / backend props.

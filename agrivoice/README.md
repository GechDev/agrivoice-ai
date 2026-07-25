# AgriVoice

Real-time, confidence-scored crop prices for Ethiopian markets — powered by crowd-reported sales.

## Prerequisites

- PHP ^8.3
- Composer
- Node.js & npm
- SQLite

## Setup (demo-ready)

```bash
composer run setup
php artisan migrate:fresh --seed
composer run dev
```

Or step by step:

```bash
cp .env.example .env
composer install
php artisan key:generate
touch database/database.sqlite
php artisan migrate:fresh --seed
npm install
npm run build
composer run dev
```

`migrate:fresh --seed` yields a fully populated showcase database. Do not live-fetch during demos.

## Development

```bash
composer run dev
```

Open **http://127.0.0.1:8000** (prefer this over `localhost` so PHP and Vite stay on the same IPv4 loopback).

If the page looks like unstyled / “raw” HTML:

1. Run `composer run dev` (Vite must be up), **or**
2. Run `npm run build` once, then `php artisan serve --host=127.0.0.1`
3. Hard-refresh the browser

Or separately:

```bash
php artisan serve --host=127.0.0.1 --port=8000
npm run dev
```

## Demo credentials

| Surface | How to sign in |
| ------- | -------------- |
| Agent portal (`/portal/login`) | Tsegaye / `1111`, Gezachew / `2222`, Nati / `3333`, Nba / `4444` |
| Cooperative portal (`/cooperative/login`) | `coop.owner@gmail.com` / `password` |
| Farmer/moderator (`/login`) | `test@example.com` / `password` |

## Key public URLs

| Path | Purpose |
| ---- | ------- |
| `/` | Landing |
| `/dashboard` | Live price dashboard (no login) |
| `/reports` | Live report feed (flagging requires login) |
| `/report-price` | Public price submission |
| `/portal/login` | Agent data-entry |
| `/cooperative/login` | Cooperative admin |

## Deploy notes

- Default DB is SQLite (`DB_CONNECTION=sqlite`). For production, set a durable DB and `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://...`.
- `QUEUE_CONNECTION=sync` is fine for demos (member invites log immediately). Use `database` + a queue worker if you need async jobs.
- Build assets before serving: `npm run build`.
- Health check: `GET /up`.

## Testing

```bash
php artisan test --compact
```

## Lint & type checking

```bash
composer run lint
npm run lint
npm run format
composer run types:check
npm run types:check
composer run ci:check
```

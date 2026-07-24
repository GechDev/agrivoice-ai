# AgriVoice

## Prerequisites

- PHP ^8.3
- Composer
- Node.js & npm
- SQLite

## Setup

```bash
# Install PHP dependencies, create .env, generate app key,
# run migrations, install NPM deps, and build frontend
composer run setup

# Or step by step:
cp .env.example .env
composer install
php artisan key:generate
touch database/database.sqlite
php artisan migrate
npm install
npm run build
```

## Development

```bash
# Start both the Laravel dev server and Vite dev server
composer run dev
```

Or separately:

```bash
php artisan serve
npm run dev
```

## Testing

```bash
php artisan test --compact
```

## Lint & Type Checking

```bash
composer run lint          # PHP (Pint)
npm run lint               # JS/TS (ESLint)
npm run format             # JS/TS (Prettier)
composer run types:check   # PHP (PHPStan)
npm run types:check        # TS (TypeScript)
composer run ci:check      # All checks + tests
```

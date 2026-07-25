# AgriVoice

AgriVoice is a multilingual agricultural market platform for Ethiopia. It turns field reports into current, confidence-scored crop prices and makes them available through a web dashboard and an Amharic keypad-based IVR experience.

Farmers and agents can report prices, cooperatives can review market activity, and users can hear crop prices without navigating a text-heavy interface.

## Main features

- Live crop prices across Ethiopian markets
- Confidence scores based on recent verified reports
- Public price reporting and agent data entry
- Cooperative member, report, price, and billing tools
- Amharic, Afaan Oromoo, and English interfaces
- Amharic IVR keypad with pre-generated Addis AI audio
- Seeded WFP historical price data for demonstrations

## Technology

- Laravel 13 and PHP 8.3
- React 19, TypeScript, and Inertia.js
- Tailwind CSS
- SQLite by default
- Pest for backend tests
- Addis AI for Amharic text-to-speech

## Requirements

- PHP 8.3 or newer
- Composer
- Node.js and npm
- SQLite with the PHP SQLite extension

## Local setup

From the repository root:

```bash
cd agrivoice
composer install
cp .env.example .env
touch database/database.sqlite
php artisan key:generate
php artisan migrate:fresh --seed
npm install --legacy-peer-deps
npm run build
```

Start the application:

```bash
composer run dev
```

Open `http://127.0.0.1:8000`.

The database seeder creates demonstration users, agents, cooperatives, reports, and market-price data.

## Amharic IVR setup

The web application works without Addis AI credentials, but audio generation requires an API key.

Add the following values to `.env`:

```dotenv
ADDIS_AI_API_KEY=your_api_key
ADDIS_AI_VOICE_ID=am-hamen
```

Create the public storage link and generate the reusable IVR prompts:

```bash
php artisan storage:link
php artisan ivr:generate-audio
```

The command shows the estimated Addis AI cost before generating audio. Generated files are stored in `storage/app/public/ivr`.

Open `/ivr` after signing in. Keys 1 through 4 announce current crop prices, while key 5 repeats the menu.

## Demo accounts

| Area | Credentials |
| --- | --- |
| Main application | `test@example.com` / `password` |
| Cooperative portal | `coop.owner@gmail.com` / `password` |
| Agent portal | Tsegaye / `1111`, Gezachew / `2222`, Nati / `3333`, Nba / `4444` |

## Important routes

| Route | Description |
| --- | --- |
| `/` | Product landing page |
| `/dashboard` | Current crop-price dashboard |
| `/reports` | Live field-report feed |
| `/report-price` | Public price submission |
| `/ivr` | Amharic keypad IVR |
| `/portal/login` | Agent sign-in |
| `/cooperative/login` | Cooperative sign-in |

## Testing

Run the test suite:

```bash
php artisan test --compact
```

Check PHP formatting:

```bash
vendor/bin/pint --test
```

Build the frontend:

```bash
npm run build
```

## Production notes

- Set `APP_ENV=production`, `APP_DEBUG=false`, and a correct HTTPS `APP_URL`.
- Replace SQLite with a durable production database when needed.
- Configure a queue worker if `QUEUE_CONNECTION` is not `sync`.
- Run `npm run build` before deployment.
- Run `php artisan storage:link` when IVR audio is enabled.
- The application health endpoint is available at `/up`.

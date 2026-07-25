# AgriVoice

AgriVoice is a multilingual agricultural market platform for Ethiopia. It transforms field reports into current, confidence-scored crop prices and delivers them through a web dashboard and an Amharic keypad-based IVR experience.

Farmers and agents can report prices, cooperatives can monitor market activity, and users can hear crop prices without navigating a text-heavy interface.

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

```bash
git clone https://github.com/GechDev/agrivoice-ai.git
cd agrivoice-ai/agrivoice
composer install
cp .env.example .env
touch database/database.sqlite
php artisan key:generate
php artisan migrate:fresh --seed
npm install --legacy-peer-deps
npm run build
composer run dev
```

Open `http://127.0.0.1:8000`.

The database seeder creates demonstration users, agents, cooperatives, reports, and market-price data.

## Amharic IVR setup

Add an Addis AI API key to `agrivoice/.env`:

```dotenv
ADDIS_AI_API_KEY=your_api_key
ADDIS_AI_VOICE_ID=am-hamen
```

Generate the reusable IVR prompts:

```bash
cd agrivoice
php artisan storage:link
php artisan ivr:generate-audio
```

The command displays the estimated Addis AI cost before generating audio. Open `/ivr` after signing in. Keys 1 through 4 announce current crop prices, while key 5 repeats the menu.

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

Run commands from the `agrivoice` directory:

```bash
php artisan test --compact
vendor/bin/pint --test
npm run build
```

More application-specific details are available in [`agrivoice/README.md`](agrivoice/README.md).

# AgriVoice AI

Ethiopian agricultural market-intelligence platform. Collects attributable crop-price reports, computes confidence-scored crop/market snapshots, and surfaces them through a public dashboard, a multilingual web experience, a field-agent PIN portal, a cooperative administration suite, and an Amharic browser-IVR simulator.

## Repository layout

| Path | Contents |
| ---- | -------- |
| [`agrivoice/`](agrivoice/) | The application (Laravel 13, Inertia 3, React 19, TypeScript, Tailwind 4, SQLite) |
| [`DOCS/`](DOCS/Documentation.md) | Top-level product and technical reference |
| [`agrivoice/DOCS/`](agrivoice/DOCS/Documentation.md) | Focused architecture, backend, frontend, security, IVR/WFP and ops references |
| `DOCS/CommitRule.md` | Git workflow and commit conventions |
| `DOCS/TestingRule.md` | Quality and testing standards |
| `DOCS/ProgrammingRulle.md` | Programming conventions |

## Quick start

```bash
cd agrivoice
composer run setup
php artisan migrate:fresh --seed
composer run dev
```

Open http://127.0.0.1:8000 (keep PHP and Vite aligned on the IPv4 loopback).

See [agrivoice/DOCS/Development-Testing-and-Operations.md](agrivoice/DOCS/Development-Testing-and-Operations.md) for full setup, demo credentials, testing, and deployment guidance.

## License

MIT — see [LICENSE](LICENSE).
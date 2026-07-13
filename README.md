# on-smart

Live e-commerce store for the Italian market — video surveillance, alarms, and smart-home equipment ([on-smart.it](https://on-smart.it)). Italian storefront, Ukrainian admin panel, backed by a physical store in Avellino.

Created by Oberemchuk Serhii.

## Stack

| Concern | Tool |
|---|---|
| Framework | Next.js 16 App Router (Turbopack, `cacheComponents`, React Compiler), React 19, TypeScript strict |
| Data | MySQL + Drizzle ORM; server actions as the data layer |
| Auth | Better Auth (admin panel today; customer accounts per active spec) |
| UI | Tailwind CSS v4, Zustand, react-hook-form, nuqs |
| Payments | PayPal, SumUp, Klarna, bank transfer (bonifico) |
| Infra | Docker standalone on Aruba Cloud; nodemailer SMTP; Aruba S3; Telegram notifications |

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values (names are documented in .env.example)
docker compose up -d          # local MySQL 8.0 (db: onsmart_dev)
npm run dev                   # Next.js dev server with Turbopack
```

Scripts: `npm run dev` · `npm run lint` · `npm test` (Vitest) · `npm run build` · `npm start`. All three quality gates (lint, test, build) must pass before any change is considered done.

Database migrations are generated in `drizzle/` and **auto-applied at container start** by `scripts/migrate.mjs` (strict by default: a failed migration blocks startup; set `MIGRATE_STRICT=0` to fail-open onto the old schema). Authoring and review of migrations stay with the project owner — CI/agents never generate or apply them unreviewed.

## Documentation

**AI agents start at [AGENTS.md](./AGENTS.md).** Human reading order:

| Doc | Purpose |
|---|---|
| [docs/project-overview.md](./docs/project-overview.md) | What the product is: audiences, environments, deployment, integrations |
| [docs/functionality.md](./docs/functionality.md) | As-built behavior: catalog, cart, checkout trace, payments, known gaps |
| [docs/architecture.md](./docs/architecture.md) | Layer model, data flow, state, auth, decision records |
| [docs/code-style-rules.md](./docs/code-style-rules.md) | Authoritative engineering rulebook (caching, actions, errors) |
| [docs/admin-actions.md](./docs/admin-actions.md) | Admin-only actions organization and access control |
| [docs/specs/client-accounts/](./docs/specs/client-accounts/00-overview.md) | ACTIVE spec: customer accounts (registration, cabinet, checkout changes) |
| [docs/to-do.md](./docs/to-do.md) | Implementation checklist |

## Deployment

Push to `main` triggers `.github/workflows/build-docker.yaml`, which builds the standalone Docker image and pushes `serhiioberemchuk/on-smart:latest`; hosting is Aruba Cloud.

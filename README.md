# StewardBridge

Cinematic full-stack Next.js workforce platform connecting people and organizations.

## Production deployment on Render

This repository is intentionally **Render-native**. It does not require Cloudflare, Wrangler, OpenNext, Workers, Pages, or R2.

### 1. Create the service

Use the included `render.yaml` Blueprint. Render will:

- install dependencies with `npm install --no-audit --no-fund`
- build the Next.js application
- run `next start` in production
- use `/api/health` as a dependency-free liveness check
- mount `/var/data` as persistent storage for uploaded documents

### 2. Configure environment variables

Required:

- `DATABASE_URL` — production Postgres/Neon connection string
- `AUTH_SECRET` — the Blueprint generates this automatically
- `NEXTAUTH_URL` — your public Render URL

Optional:

- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for Google sign-in
- `ADMIN_EMAIL` for the initial admin authorization rule

### 3. Prepare the database

The project uses Drizzle ORM. Before first use, push the current schema to your production database:

```bash
npm run db:push
```

For a mature production workflow, replace schema-push with reviewed Drizzle migrations before making frequent schema changes.

### 4. Storage

Uploaded documents are stored under `STORAGE_DIR`. Render sets this to `/var/data/documents`, which lives on the service's persistent disk.

Do not remove the disk if you need to retain uploaded documents. For higher-scale deployments, move document storage to a dedicated object-storage provider and keep the same storage abstraction.

### 5. Health endpoints

- `GET /api/health` — liveness; returns 200 when the Node service is running.
- `GET /api/health/db` — readiness-style database connectivity check; returns 503 if Postgres cannot be reached.

## Local development

```bash
npm install
npm run dev
```

Useful checks before pushing:

```bash
npm run lint
npm run typecheck
npm run build
```

## Frontend experience

The UI includes cinematic image transitions, scroll reveals, pointer lighting, tactile hover states, responsive navigation, a Cinematic/Calm toggle, and reduced-motion support.

## Integration note

The included n8n workflow should use the public Render URL for its website webhook target. Replace the placeholder `YOUR-RENDER-DOMAIN` value in the workflow before activating it.

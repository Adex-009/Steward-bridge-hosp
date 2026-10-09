# StewardBridge — Render deployment checklist

## Before deployment

- [ ] Push this project to GitHub/GitLab/Bitbucket.
- [ ] In Render, create a Blueprint from the repository so `render.yaml` is applied.
- [ ] Provide `DATABASE_URL`.
- [ ] Confirm the generated `AUTH_SECRET` is present.
- [ ] Set `NEXTAUTH_URL` to the final public Render URL.
- [ ] If Google sign-in is enabled, add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
- [ ] If admin bootstrap is used, set `ADMIN_EMAIL`.
- [ ] Keep the persistent disk mounted at `/var/data`.

## First deployment

1. Wait for the build to finish.
2. Open `/api/health` and confirm HTTP 200.
3. Open `/api/health/db` and confirm HTTP 200.
4. Apply the database schema with `npm run db:push` if the production database has not been initialized.
5. Create a test account and verify sign-in.
6. Upload a small document and verify it can be opened again.
7. Test the main candidate and business flows.
8. Replace the n8n webhook placeholder with the final Render URL before activating the workflow.

## Production hardening

- Use a reviewed migration workflow instead of repeated `drizzle-kit push` once the schema is stable.
- Keep `AUTH_SECRET` private and rotate it deliberately because rotation invalidates existing sessions.
- Back up the Render persistent disk or migrate documents to durable object storage before scaling beyond a small deployment.
- Configure your Google OAuth callback URL for the final production hostname if Google login is enabled.

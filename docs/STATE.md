# Opportunity Tracker State

## Production

- Site: https://opportunity-tracker-sw.netlify.app
- Published deploy before containment: `69cfeb474f8a5ae70bebac76`
- Source repository: `sewagner13-jpg/opportunity-tracker`

## Active ticket

- `OPPORTUNITY-API-AUTH-01` — ACTIVE
- Deployment and bounded Netlify configuration authorized by Sean on 2026-08-12 at 19:22 America/New_York.
- Opportunity record writes and migrations are not authorized.

## Current blocker

- Production `/api/opportunities` remains publicly readable until the shared server credential is configured and this ticket is deployed.

## Baseline

- `npm run build` passes at `ba9f712`.
- Existing lint baseline has 8 errors and 19 warnings outside this ticket.
- No test script existed before this ticket.

## Next action

- Configure the server-only credential, deploy once, and prove unsigned GET/HEAD and write methods fail closed before closing the ticket.

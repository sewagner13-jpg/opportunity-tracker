# Ticket: OPPORTUNITY-API-AUTH-01

## Status

ACTIVE

deployment_authorized: true

external_configuration_authorized: true only for the server credential and one bounded Netlify production deploy

opportunity_record_mutation_authorized: false

## Owner outcome

An unauthenticated request cannot read, create, update, or delete Opportunity
Tracker records through `/api/opportunities` or `/api/opportunities/:id`.
ShelfCycle Assistant can perform its owner-authorized, read-only server request
through a separate server-only credential.

## Scope

- Require an exact bearer credential before database access on every
  Opportunity endpoint method.
- Fail closed when the credential is absent or invalid.
- Return bounded, `no-store` 401/503 responses with an empty HEAD body.
- Keep the credential in provider configuration only; never expose it to the
  browser, repository, logs, chat, or proof artifacts.
- Deploy upstream before ShelfCycle and run non-mutating production smoke.

## Deliberate containment behavior

The direct browser application does not receive the server credential, so its
record-backed screens remain fail-closed until a separate interactive owner
authentication ticket is approved. This is safer than publishing the service
credential or treating forgeable Origin/Referer headers as authentication.

## Acceptance

- [x] Current unsigned production GET reproduced 24 exposed records.
- [x] Unit regression failed before implementation and passes after it.
- [x] Local production build returns 503 before database access for unsigned
      GET, HEAD, POST, PUT, PATCH, and DELETE; HEAD returns no body.
- [ ] Server credential is present on both Netlify sites without disclosure.
- [ ] Unsigned production GET/HEAD and all write methods fail closed before
      parsing a body or accessing the database.
- [ ] ShelfCycle's owner-authorized proxy still retrieves sanitized rows.
- [ ] Deployment identity and rollback deploy are recorded.

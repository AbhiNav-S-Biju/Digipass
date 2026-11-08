# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Owners**: people recording their digital accounts (email, social, finance, entertainment) and deciding what happens to each one after they die. They return occasionally to add or edit assets, name executors, generate their digital will, and check in on the Dead Man's Switch.
- **Executors**: trusted people (often family) named by an owner. They sign in after access is granted, usually while grieving, to carry out the owner's wishes account by account, following step-by-step instructions.

## Product Purpose

DIGIPASS is a digital estate manager. Owners record each account with an after-death action, assign executors, and produce a digital will PDF. A Dead Man's Switch detects inactivity and releases access. Executors then see the owner's assets and are guided through closing, passing on, or posting a last message for each one. Success: every account is handled the way the owner intended, without the executor guessing.

## Positioning

Each asset carries an explicit, owner-chosen action (pass on, delete, leave a last message) and turns into a guided, platform-specific workflow for the executor, rather than a password list handed over in bulk.

## Operating Context

- Owner dashboard (`frontend/dashboard.html`): Overview, Digital Assets, Executors, Digital Will, Dead Man's Switch.
- Executor portal (`frontend/executor-dashboard.html`): the owner's assets, per-asset instruction workflow window (`frontend/workflow-window.html`), will download.
- Executor progress per asset is saved in the browser (localStorage), not on the server.
- Backend: Node/Express + PostgreSQL; frontend is static HTML + Bootstrap 5 + vanilla JS.

## Capabilities and Constraints

- Asset after-death actions: `pass`, `delete`, `last_message`.
- Executor statuses: invited, verified, active; access is granted or revoked by the owner.
- Credentials (account passwords) are shown to executors; treat their display carefully.
- Organising decision (confirmed): owner assets are grouped by after-death action; executor assets are grouped by progress.

## Brand Commitments

- Name: DIGIPASS. Tagline in use: "Trust. Security. Legacy."
- The existing palette is binding (user confirmed): forest green (#1b3a2d, #2d5a42, #3d7a5a), sage (#d4ead8), cream (#f5ead8, #fdf6ec), sand (#e8d9c0, #d4c4a0), text #1a2e22 / #5a7260.
- Voice: calm and gentle, especially on the executor side. Progress reads as care, not deadlines (e.g. "Not started / In progress / Taken care of").

## Evidence on Hand

- Product illustrations in `frontend/`: `hero_vault.png`, `encryption_shield.png`, `executor_handover.png`, `dashboard_preview.png`.
- No member photos exist; do not fabricate people, testimonials, or usage numbers.

## Product Principles

1. The owner's intent is the source of truth; every screen makes each asset's chosen action obvious.
2. Executors should never have to guess the next step.
3. Calm over urgency: no alarm styling unless something truly needs attention (e.g. a triggered switch).
4. Sensitive data is revealed deliberately, never by default.

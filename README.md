# DIGIPASS — Digital Estate Manager

DIGIPASS lets a person record their digital accounts (email, social media, money, storage, streaming), decide what should happen to each one after they die, and name trusted executors who carry those wishes out. A **Dead Man's Switch** watches for inactivity and, if the owner stops checking in, opens access for their executors. Executors then get a calm, step-by-step guide for every account.

**Live:** frontend on Vercel — <https://digipass-pi.vercel.app> · API on Render — <https://digipass-3l63.onrender.com>

---

## Contents

- [How it works](#how-it-works)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started (local)](#getting-started-local)
- [Environment variables](#environment-variables)
- [Email delivery](#email-delivery)
- [Test accounts](#test-accounts)
- [Deployment](#deployment)
- [API reference](#api-reference)
- [Data model](#data-model)
- [Security notes and known limitations](#security-notes-and-known-limitations)

---

## How it works

There are two kinds of people in DIGIPASS:

| Role | What they do |
|---|---|
| **Owner** | Signs up, records each account and chooses its after-death action, invites executors, generates a digital will PDF, and checks in from time to time. |
| **Executor** | A trusted person (family, friend, lawyer) invited by the owner. Verifies by email, sets a password, and — once access is granted — follows a guide for each account. |

### The owner's journey

1. **Record accounts.** For each account the owner stores the platform, the sign-in (email/username and password), and one of three actions:
   - **Pass on** — the executor takes the account over.
   - **Delete** — the account is closed for good.
   - **Last message** — the executor posts a final message the owner wrote, then closes it.
2. **Invite executors.** Each executor gets an invitation link (by email, or shared manually as a link/QR code). They verify and set their own password.
3. **Generate the digital will.** A PDF summarising every account, its action, the executors, and an optional personal message.
4. **Check in.** The Dead Man's Switch expects a check-in within the owner's chosen interval (7–365 days, default 30). Signing in or pressing **Check in** both reset the timer.

### What happens when the switch triggers

A scheduled job runs **daily at midnight** (`node-cron`, `0 0 * * *`). For each owner, if the time since they last signed in or checked in exceeds their interval, the switch is marked **triggered** and **all of that owner's executors are granted access**. The owner can also grant or revoke an executor's access manually at any time.

### The executor's journey

1. Accept the invitation and set a password (`executor-register.html`).
2. Sign in to the **executor portal** (`executor-login.html` → `executor-dashboard.html`). Until access is granted, the portal says so.
3. Work through the owner's accounts on a board grouped by progress: **Not started → In progress → Taken care of**.
4. Open the **step-by-step guide** for an account. It shows the sign-in details and platform-specific steps (e.g. how to delete an Instagram account, or post a farewell on Facebook).
   - **Laptop:** the guide opens as a narrow window on the left and *Open … side by side* puts the real site on the right. In Chrome/Edge, *Float guide* turns it into an always-on-top floating window.
   - **Phone:** a compact step card; *Open Instagram* hands off to the installed app and, on return, the guide asks whether the step worked.
   - Progress is saved in the browser and the board updates live as steps are finished.
5. Download the owner's digital will.

> Real sites such as Instagram or Gmail can't be embedded inside DIGIPASS — they refuse to load inside other websites — which is why the guide sits beside them instead.

---

## Features

**Owner dashboard** (`frontend/dashboard.html`)
- **Overview:** estate readiness score, a setup checklist (still to do / done), recent activity.
- **Digital assets:** board grouped by action (Pass on / Delete / Last message), list view, search, category filter, add/edit/remove accounts.
- **Executors:** board by status (Invited / Verified / Has access), invite, share invite link + QR, grant/revoke access, remove.
- **Digital will:** accounts grouped by action, named executors, generate/download PDF, personal message.
- **Dead Man's Switch:** status, days left, check in, change interval, who gets notified.

**Executor portal** (`frontend/executor-dashboard.html`) — progress board, action filters, will download, step-by-step guide (`frontend/workflow-window.html`).

**Interface**
- Desktop: collapsible deep-forest **glass sidebar** (icons + labels, or icons only); the selected item slides into a glowing round button.
- Phones: no sidebar; content scrolls vertically and navigation is a **glass bottom dock** where the selected item floats up.
- Shared styles in `frontend/css/board.css`; shared shell logic in `frontend/js/shell.js`.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Static HTML, vanilla JavaScript, Bootstrap 5, Font Awesome 6, DM Sans |
| Backend | Node.js, Express 4 |
| Database | PostgreSQL (hosted on Neon) via `pg` |
| Auth | JWT (`jsonwebtoken`), bcrypt password hashing (`bcryptjs`) |
| Scheduling | `node-cron` (Dead Man's Switch) |
| Email | Brevo, SendGrid, SMTP (`nodemailer`) and Resend — tried in that order |
| Will PDF | Python `generate-will.py` (ReportLab), invoked from Node |
| QR codes | `qrcode` |
| Hosting | Vercel (static frontend), Render (API + frontend) |

---

## Project structure

```
Digipass/
├── server.js                 # Express app: middleware, routes, static frontend, scheduler start
├── db.js                     # PostgreSQL connection pool (reads DB_* env vars)
├── controllers/              # Request handlers (auth, assets, executors, executor portal, will, switch)
├── routes/                   # Express routers mounted under /api
├── middleware/               # JWT auth for owners and executors
├── utils/
│   ├── mailer.js             # Invitation email: Brevo → SendGrid → SMTP → Resend fallback
│   ├── deadMansSwitchScheduler.js  # Daily inactivity check
│   ├── dbInit.js             # Creates/migrates tables on first request
│   ├── rateLimiter.js        # Per-IP rate limits (auth and general API)
│   ├── qrCode.js             # Invite links and QR codes
│   └── ...                   # jwt, bcrypt, activity logger, validation
├── generate-will.py          # Digital will PDF generator (ReportLab)
├── requirements.txt          # Python dependencies for the PDF generator
├── scripts/
│   └── seed-test-accounts.js # Creates a test owner and a ready-to-use test executor
├── frontend/
│   ├── index.html, login.html, register.html          # Landing and owner auth
│   ├── dashboard.html                                  # Owner dashboard (all tabs)
│   ├── executor-*.html                                 # Executor login, verify, register, portal
│   ├── workflow-window.html                            # Step-by-step guide
│   ├── css/board.css                                   # Shared design system
│   └── js/                                             # config.js (API origin), utils.js, dashboard.js,
│                                                       # shell.js, workflow-steps-detailed.js (guides)
├── render.yaml               # Render service definition
└── vercel.json               # Vercel config
```

`frontend/js/config.js` decides where API calls go: same-origin when the page is served by the Node server (Render or `localhost:3000`), otherwise the Render API (e.g. on Vercel).

---

## Getting started (local)

**Prerequisites:** Node.js 18+, a PostgreSQL database (local or a free [Neon](https://neon.tech) project), and optionally Python 3 for will PDFs.

```bash
git clone https://github.com/AbhiNav-S-Biju/Digipass.git
cd Digipass
npm install                      # also runs build.sh to install Python deps if Python is present
cp .env.example .env             # then fill in the values below
npm run dev                      # or: npm start
```

Open <http://localhost:3000>. Tables are created automatically on the first request (`utils/dbInit.js`).

For will PDFs, install the Python dependency if `npm install` didn't:

```bash
pip install -r requirements.txt
```

---

## Environment variables

Copy `.env.example` to `.env`. Never commit `.env` (it is gitignored).

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | no | Server port (default `3000`). |
| `NODE_ENV` | yes | `development` or `production`. Rate limiting is only enforced in production. |
| `APP_BASE_URL` | yes | Public URL used to build executor invite links. |
| `JWT_SECRET` | yes | Secret for signing login tokens. Use a long random value. |
| `CORS_ORIGIN` | yes | Comma-separated frontends allowed to call the API (e.g. your Vercel URL). |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | yes | PostgreSQL connection. SSL is enabled automatically for Neon hosts. |
| `EMAIL_FROM` | for email | Sender address. With Brevo it must be a verified sender. |
| `BREVO_API_KEY` | one email provider | Brevo transactional email key (tried first). |
| `SENDGRID_API_KEY` | optional | SendGrid key. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | optional | Any SMTP server. |
| `RESEND_API_KEY` | optional | Resend key. |
| `DISABLE_RATE_LIMIT` | no | `true` to switch rate limiting off. |

---

## Email delivery

Invitation emails are sent by `utils/mailer.js`, which tries every configured provider in order — **Brevo → SendGrid → SMTP → Resend** — and stops at the first that succeeds. It never blocks an invitation: if no provider can send, the owner's dashboard opens **Share the invite** with a fresh link and QR code (also available from an invited executor's **⋯** menu), and shows why the email failed.

**Recommended: Brevo** — it sends over HTTPS (works on hosts that block SMTP ports) and its free plan needs only one verified sender address, no domain.

1. Create a free Brevo account and verify your sender address under **Senders**.
2. Create an API key (**Settings → SMTP & API → API keys**) with **Transactional email: All** and everything else **None**.
3. Set `BREVO_API_KEY` and `EMAIL_FROM` (the verified address) in your environment.

---

## Test accounts

```bash
node scripts/seed-test-accounts.js --yes
```

Creates (or refreshes) a test owner `test.owner@digipass.test` with four sample accounts, and a test executor `test.executor@digipass.test` who is already verified and has access. Random passwords are written to `test-accounts.local.json` (gitignored), never printed. It writes to whatever database `.env` points at — including a shared production database — so run it deliberately.

---

## Deployment

- **Render** (`render.yaml`) runs `node server.js`, which serves both the API and the frontend, and runs the Dead Man's Switch scheduler. Set the environment variables above in the Render dashboard. Pushes to `main` redeploy automatically.
- **Vercel** serves the static frontend from `frontend/`. Its pages call the Render API (see `frontend/js/config.js`); add the Vercel URL to `CORS_ORIGIN` on Render.

---

## API reference

All routes are under `/api`. Owner routes need `Authorization: Bearer <owner token>`; executor routes need an executor token.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Health check |
| POST | `/auth/register` | — | Create an owner account |
| POST | `/auth/login` | — | Owner sign-in, returns a JWT |
| GET | `/auth/me` | owner | Current owner |
| GET | `/assets` | owner | List accounts (reports `has_password`, never the password) |
| POST | `/assets` | owner | Add an account |
| PATCH | `/assets/:id` | owner | Update an account (blank password keeps the saved one) |
| DELETE | `/assets/:id` | owner | Remove an account |
| GET | `/executors` | owner | List executors |
| POST | `/executors` | owner | Invite an executor (sends email or returns an invite link) |
| POST | `/executors/:id/resend-verification` | owner | New invite link + QR code |
| PATCH | `/executors/:id/grant-access` | owner | Grant access |
| PATCH | `/executors/:id/revoke-access` | owner | Revoke access |
| DELETE | `/executors/:id` | owner | Remove an executor |
| GET | `/executors/verify` | — | Verify an invite token |
| POST | `/executors/setup-password` | — | Executor sets a password |
| POST | `/executor/login` | — | Executor sign-in |
| POST | `/executor/register` | — | Executor registration via invite token |
| GET | `/executor/assets` | executor | The owner's accounts (only once access is granted) |
| GET | `/executor/asset-instructions/:assetId` | executor | Instructions for one account |
| GET | `/executor/will/download/:userId` | executor | Download the owner's will PDF |
| GET | `/will` | owner | Will status |
| GET | `/generate-will` | owner | Generate the will PDF |
| GET | `/download-will/:willId` | owner | Download a generated will |
| GET / POST | `/will-content` | owner | Read / save the personal message |
| GET | `/dead-mans-switch/status` | owner | Status, interval, days left |
| POST | `/dead-mans-switch/check-in` | owner | Check in |
| PUT | `/dead-mans-switch/interval` | owner | Change the interval (7–365 days) |
| GET | `/dead-mans-switch/executor-notifications` | owner | Executors who will be notified |
| GET | `/activity` | owner | Recent activity |

---

## Data model

| Table | Holds |
|---|---|
| `users` | Owners: name, email, bcrypt password hash, last activity |
| `digital_assets` | Accounts: platform, category, sign-in, password, action, last message |
| `executors` | Executors per owner: contact, relationship, verification status, access flag, password hash, invite token hash |
| `dead_mans_switch` | Per owner: interval, last check-in, status (`active` / `triggered`) |
| `digital_will` | Generated will record and personal message |
| `user_activity` | Activity log shown on the dashboard |

---

## Security notes and known limitations

- **Account passwords are stored in plain text** in `digital_assets.account_password`. An AES-256-GCM helper exists in `utils/crypto.js` but is not wired in yet. The owner's dashboard never receives stored passwords back, but executors with access do (by design). Encrypting at rest is the top security improvement to make.
- Owner and executor passwords are bcrypt-hashed; invite tokens are stored as hashes and expire after 24 hours.
- Login tokens are kept in the browser's `localStorage`.
- Executor guide progress is saved per browser, so it doesn't follow an executor to another device.
- On Render's free plan the server sleeps when idle, so the midnight Dead Man's Switch job only runs while it is awake. Use a paid instance or an external scheduler that calls the API for reliable checks.
- Waking the sleeping server takes 30–60 seconds. Every page loads `frontend/js/server-status.js`, which pings `/api/health` on load (starting the wake-up early) and, if the answer is slow, shows a "Starting the DIGIPASS server…" bar with a seconds counter until it responds. Sign-in and sign-up forms wait for the server (`DigipassServer.whenReady()`) instead of failing.
- Many root-level `check-*.js`, `migrate-*.js` and `test-*.js` files are one-off maintenance scripts from development.

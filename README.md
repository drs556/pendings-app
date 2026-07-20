# Pendings

A shared to-do/"pendings" board for Javier and Andy — cards with a title, topic,
description, due date and importance, filterable by owner. Built with Next.js
(App Router), Prisma + SQLite, Tailwind, and shadcn/ui.

This README also doubles as a short explainer of the deployment infrastructure,
since part of the point of this project was learning how that works.

## Stack

- **Next.js 16** (App Router, TypeScript, Server Actions) — one process serves
  both the UI and the "API" (there is no separate backend).
- **Prisma ORM + SQLite** — the whole database is a single file (`dev.db`) next
  to the project. No database server to install or manage.
- **Tailwind CSS + shadcn/ui** (on Base UI primitives) — accessible components
  whose source lives in `src/components/ui`, not a black-box dependency.
- **react-hook-form + zod** — form state and validation, validated again on the
  server inside each Server Action (never trust client input alone).

There's no login system. Identity is a lightweight "who's using this?" picker
(Javier/Andy) stored in a cookie — appropriate for two people sharing a home
network, not for anything exposed to the internet.

The UI runs a NERV-terminal (Evangelion) look, with a light/dark toggle in the
header (`src/components/theme-toggle.tsx`, via `next-themes`). Note: the
toggle reloads the page on click — Tailwind's `color-mix()`-based opacity
utilities (`bg-primary/15` etc.) didn't reliably repaint on a pure class swap
in testing, even though the underlying CSS variable updated correctly. A
reload guarantees a correct paint every time, which is a fine trade-off for
something clicked this rarely.

## Getting started (development)

```bash
npm install        # also runs `prisma generate` via postinstall
npm run dev         # http://localhost:3000
```

The SQLite database (`dev.db`) and its migration history live in this repo's
`prisma/` folder / project root. `npm install` only generates the Prisma
client; if you ever change `prisma/schema.prisma`, run:

```bash
npx prisma migrate dev --name <what-changed>
```

## Running it so Andy can reach it from another computer (LAN)

By default, `next dev` / `next start` only listen on `localhost`, meaning only
the machine actually running the server can open the app. To make it reachable
from another device on the same Wi-Fi/router, the server needs to bind to
**all** network interfaces, not just the loopback one:

```bash
npm run build
npm run start:lan     # runs: next start -H 0.0.0.0
```

`-H 0.0.0.0` is what makes the difference — it tells Next.js to accept
connections arriving on any of the machine's network interfaces (its Wi-Fi/
Ethernet IP), not just `127.0.0.1`.

Then:

1. On the machine running the server, find its LAN IP address:
   - Windows: `ipconfig` → look for "IPv4 Address" under your active adapter
     (typically something like `192.168.1.42`).
2. On Andy's computer (same Wi-Fi network), open `http://<that-ip>:3000` in a
   browser.
3. **Windows Firewall** will likely prompt the first time the server starts,
   asking whether to allow Node.js to accept connections on a Private network.
   Choose **Allow** — this is what lets Andy's request through.

### Known limitations of this approach

- The app is only reachable while that computer is on, the terminal (`npm run
  start:lan`) is still running, and both computers are on the same network.
- Most home routers assign IP addresses dynamically (DHCP), so the LAN IP can
  change after a router reboot. If that becomes annoying, reserve a static IP
  for the host machine in your router's settings (usually called "DHCP
  reservation" or "static lease").

## Deploying to the cloud later (Vercel)

The app is intentionally built so this is a config change, not a rewrite:

1. **Swap the database.** SQLite is a local file, which doesn't work on
   Vercel's serverless functions (no persistent disk). Create a free Postgres
   database (e.g. [Neon](https://neon.tech) or Vercel Postgres) and update
   `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
   }
   ```
   You'd also switch the driver adapter in `src/lib/prisma.ts` from
   `@prisma/adapter-better-sqlite3` to `@prisma/adapter-pg` (or your chosen
   Postgres adapter), and set `DATABASE_URL` to the Postgres connection string.
2. Run `npx prisma migrate deploy` against the new database.
3. `vercel deploy` (or connect the GitHub repo in the Vercel dashboard).

Identity (the Javier/Andy picker) and all UI code stay exactly the same —
that part has no dependency on where the database lives.

## Project structure

```
prisma/schema.prisma        # data model (Pending, Topic, Owner/Importance enums)
src/app/actions.ts           # Server Actions: create/update/delete/toggle, setCurrentUser, moveTopic
src/app/page.tsx              # board page (server component, fetches data)
src/components/board.tsx        # client component: filter/sort state, groups pendings by topic order
src/components/topic-section.tsx  # collapsible section wrapper + up/down move buttons
src/components/pending-row.tsx  # single compact row within a topic section
src/components/pending-form-dialog.tsx  # create/edit dialog (react-hook-form + zod, topic autocomplete)
src/components/user-switcher.tsx        # "who's using this?" + profile switcher
src/lib/prisma.ts             # Prisma client singleton (SQLite driver adapter)
src/lib/current-user.ts        # profile cookie helpers
src/lib/validation.ts           # shared zod schema for a Pending
```

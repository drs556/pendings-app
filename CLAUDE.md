# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Git identity

This project uses Javier's **personal** account/email (`drs556@york.ac.uk`), never the work GitHub account or its SSH key (`id_ed25519_work`). The repo-local `user.name`/`user.email` are already set correctly (not global) — don't override them, and don't push using the work identity even if it's the default elsewhere on this machine.

## Commands

- `npm run dev` — dev server (Turbopack, http://localhost:3000)
- `npm run build` / `npm run start` — production build/run (localhost only)
- `npm run start:lan` — production server bound to `0.0.0.0`, reachable from other devices on the LAN
- `npm run lint` — ESLint
- `npx tsc --noEmit` — type-check (no separate `typecheck` script)
- `npx prisma migrate dev --name <desc>` — after changing `prisma/schema.prisma`
- `npx prisma generate` — regenerate the Prisma client (also runs via `postinstall`)

There is no test suite in this project.

## Architecture

**No REST/GraphQL API.** All mutations go through Server Actions in `src/app/actions.ts`, called directly from Client Components via `startTransition`. Every action ends with `revalidatePath("/")` — that's the only refetch mechanism; there's no client-side query/cache library.

**Data flow:** `src/app/page.tsx` (Server Component) is the only place that queries Prisma directly (`pending` and `topic` tables) and reads the identity cookie. It hands plain data down to `Board` (Client Component), which owns all filter/sort/grouping state and derives everything else via `useMemo`.

**Topics have their own identity.** `Pending.topic` is a free-typed string, not a foreign key — but topic *order* is tracked separately in a `Topic` model (`name`, `order`). `ensureTopic()` in `actions.ts` lazily creates a `Topic` row (appended last) the first time a name is used in `createPending`/`updatePending`; `moveTopic()` swaps `order` with the adjacent row. On desktop (`useMediaQuery` in `src/lib/use-media-query.ts`, `min-width: 768px`), `board.tsx` splits topics into two columns balanced by item count — not CSS `columns`, which produced visibly uneven pairings when tried. Mobile always renders one flat column in stored order.

**Identity is a cookie, not auth.** `src/lib/current-user.ts` reads/writes a plain `pendings-current-user` cookie (`JAVIER`/`ANDY`). No sessions or passwords — only appropriate because this runs on a trusted home LAN.

**Prisma uses the driver-adapter architecture (Prisma 7+), not the classic client.** `prisma/schema.prisma` has `generator client { provider = "prisma-client" }` outputting to `src/generated/prisma` (gitignored — regenerate after pulling). `src/lib/prisma.ts` constructs `PrismaClient` with an explicit `@prisma/adapter-better-sqlite3` adapter; `new PrismaClient()` with no args throws. The generated client uses extensionless relative imports, so it can't run under plain `node` — use `npx tsx` for one-off scripts against it.

**Theming:** `src/app/globals.css` defines full light and dark palettes (same accent hues — NERV orange / Eva red / Eva green — different lightness per mode), toggled via `next-themes` (`src/components/theme-toggle.tsx`). The toggle calls `window.location.reload()` after `setTheme()`: Tailwind's `color-mix()`-based opacity utilities (`bg-primary/15` etc.) didn't reliably repaint on a live class swap in testing, so a reload guarantees a correct paint.

**shadcn/ui here is built on Base UI, not Radix** (`src/components/ui/*`) — prop APIs differ from the Radix-based examples most training data assumes (e.g. `Select` needs an `items` prop for the trigger to render a label; `Dialog`/`Popover` use a `render` prop instead of `asChild`). Check the actual component source before assuming a prop exists.

**Turbopack dev-server cache gotcha:** after editing `prisma/schema.prisma` and regenerating the client, a running `next dev` process can keep serving a stale bundle. If a model that definitely exists throws `Cannot read properties of undefined`, stop the dev server, delete `.next`, and restart rather than debugging further.

# FoundTab Portal — Coding Rules

All global rules in `~/.claude/CLAUDE.md` apply. This file adds repo-specific guidance.

## Stack

Next.js 15 + App Router + TypeScript strict. Tailwind CSS. shadcn/ui (added in T20).
TanStack Query for client-side data fetching within Server Components.

## Key constraint

**Portal never connects to the database directly.** All data flows through
`foundtab-backend /api/admin/*` endpoints authenticated with `FOUNDTAB_ADMIN_API_KEY`.

## Folder structure

```
app/                      ← Next.js App Router pages + layouts + API routes
src/
  components/             ← shared portal UI components
  lib/                    ← admin API client
  config/                 ← env.ts (server-side vars), constants.ts
  types/                  ← shared TypeScript types
```

## Admin API client

`src/lib/adminApi.ts` wraps all `foundtab-backend /api/admin/*` calls.
Always passes `x-admin-key` header from `env.FOUNDTAB_ADMIN_API_KEY`.

## UX rule — internal tooling

Portal is used by the FoundTab team (technical). UX can be more dense than the customer app.
Still: clear labels, loading states, and empty states are mandatory.

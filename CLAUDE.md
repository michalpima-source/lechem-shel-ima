# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**לחם של אמא** — an online boutique bakery (challah, cakes, sweets) built with Next.js 16 App Router + Supabase + shadcn/ui. The UI is fully RTL Hebrew.

## Commands

```bash
npm run dev          # dev server with Turbopack
npm run build        # production build
npm run typecheck    # TypeScript check without emit
npm run lint         # ESLint
npm run format       # Prettier (TS/TSX files)
```

Run all commands from the project root (`c:\Users\michal\Desktop\תוצרי AI\7-1`).

## Architecture

### Routes (`app/`)

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/menu` | Product catalog (server component, fetches available products) |
| `/cart` | Cart checkout + order submission form |
| `/login`, `/register` | Supabase auth (client components — wrap `useSearchParams` in `<Suspense>`) |
| `/my-orders` | Logged-in user's order history |
| `/admin/orders` | Admin: view + update order status |
| `/admin/products` | Admin: CRUD products |
| `/admin-setup` | One-time admin bootstrap |

### Auth & Authorization

Two layers protect `/admin`:
1. **`middleware.ts`** — redirects unauthenticated users to `/login?redirect=...`
2. **`app/admin/layout.tsx`** — server-side double-check: re-fetches user + `profiles.is_admin`; redirects to `/menu` if not admin

### Supabase Clients (`lib/supabase/`)

- **`client.ts`** — browser client, uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **`server.ts`** — two exports:
  - `createClient()` — publishable key, for normal user operations
  - `createAdminClient()` — `SUPABASE_SECRET_KEY`, for admin reads (bypasses RLS)

**⚠️ Key naming uses the 2026 Supabase API format** — `PUBLISHABLE_KEY` / `SECRET_KEY`, not the legacy `ANON_KEY` / `SERVICE_ROLE_KEY`.

### Server Actions (`lib/actions/`)

All DB mutations are Server Actions (`'use server'`). Pattern:
- Call `createClient()` or `createAdminClient()` inside the action
- Return `{ success: boolean; error?: string }` on mutations
- Call `revalidatePath(...)` after mutations

### Cart (`lib/cart-context.tsx`)

Client-side only, persisted to `localStorage` under key `bakery-cart`. `CartProvider` wraps the root layout. Hydration is deferred (guarded by `hydrated` state) to avoid SSR mismatch.

### Types (`lib/types.ts`)

Single source of truth for: `Product`, `Order`, `OrderItem`, `CartItem`, `Profile`, `OrderStatus`, `ProductCategory`, and the display maps `STATUS_LABELS` / `STATUS_COLORS`.

## Styling

- **Tailwind CSS v4** — theme tokens are defined directly in `app/globals.css` inside `@theme { }` blocks. There is no `tailwind.config.js`.
- **shadcn/ui** — style is `base-nova`. This style does **not** use the `asChild` prop on primitives.
- **Dark mode** — implemented via `.dark` class (next-themes). Override tokens in the `.dark { }` block in `globals.css`.
- **RTL** — `<html dir="rtl" lang="he">` in layout. `components.json` has `"rtl": true`.

## Known Quirks

- **framer-motion v12**: `AnimationProps` type was removed. Skip the type annotation or use `MotionProps`. Spread framer props onto `motion.*` elements as `as any` when combining with HTML event handler types.
- **`useSearchParams()` requires Suspense**: In Next.js 15+, any component calling `useSearchParams()` must be wrapped in `<Suspense>` at the page level to avoid prerender errors. Pattern: extract into a `*Content` component, export a default that wraps it in `<Suspense>`.
- **`middleware.ts` deprecation warning**: Next.js 16 renames `middleware` to `proxy`. The warning is cosmetic — the file works correctly.

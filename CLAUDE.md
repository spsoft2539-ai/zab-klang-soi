# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Next.js version

This project uses **Next.js 16.2.6 with React 19.2**. APIs, conventions, and file conventions differ from older Next.js versions in your training data. Before writing or modifying anything that touches Next.js APIs (routing, layouts, metadata, `next/image`, server components, caching, params, etc.), consult the bundled docs at `node_modules/next/dist/docs/01-app/` and heed any deprecation notices. Do not rely on memorized Next.js patterns.

## Commands

- `npm run dev` — start dev server on http://localhost:3000
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`, extends `next/core-web-vitals` + `next/typescript`)

There is no test runner configured.

## Project: แซ่บกลางซอย (Saep Klang Soi)

A Thai-language restaurant ordering / POS web app. The UI is mobile-first (`max-w-sm` customer screens) with a separate desktop cashier console. All user-facing copy is Thai.

### Route structure (App Router)

- `app/layout.tsx` — root layout, sets `lang="th"` and the global `#F7F3EF` background.
- `app/(main)/` — customer menu route group. Its layout wraps children with `MenuHeader`, `Category` tabs, and a sticky `CartBottomBar`. `(main)/page.tsx` is the menu landing page.
- `app/cart/` — customer cart. Uses `useTransition` + `router.push("/orders")` to "submit".
- `app/orders/` — post-submission order status (queued / preparing / served sections) and payment selector (PromptPay / counter).
- `app/cashier/` — desktop staff console: table grid by zone (A–D), table detail with order items, status transitions (`available` → `active` → `preparing` → `billing`), bill generation with 7% VAT.

State today is **local component state with hardcoded mock data** in each page — there is no backend, no data layer, no auth. When wiring real data, expect to introduce a fetching/state strategy from scratch.

### Shared building blocks

- `components/` — feature components (`Navbar`, `Category`, `Card`, `CartMenu`, `cart-item-card`, `submitted-order-card`).
- `components/ui/` — shadcn primitives (`button`, `tabs`, `badge`, `input`).
- `lib/utils.ts` — `cn()` (clsx + tailwind-merge).
- Path alias: `@/*` maps to repo root (e.g. `@/components/Card`, `@/lib/utils`).

### Styling & design system

- **Tailwind CSS v4** via `@tailwindcss/postcss`. Theme tokens live in `app/globals.css` (no `tailwind.config`).
- **shadcn** configured in `components.json` with style `radix-maia`, base color `neutral`, icon library `hugeicons`. RSC + TSX enabled.
- Two icon libraries are in use: `@tabler/icons-react` (most pages) and `@hugeicons/react` (shadcn default). Match whatever the surrounding file uses.
- Recurring visual motif: a torn-paper edge implemented as an inline SVG data URL stored in a `TEAR_BG` constant — copy the existing constant rather than reinventing it.
- The constant `VAT_RATE = 0.07` is duplicated in `cashier/page.tsx` and `orders/page.tsx`; keep them in sync if changed.

### Image domains

`next.config.ts` only whitelists `placehold.co` for `next/image`. Add new remote hosts to `images.remotePatterns` before referencing them.

## Conventions

- Pages with interactivity start with `"use client"`. Keep server components server-only unless a hook or browser API is needed.
- Thai text is the source of truth for UI strings — do not translate or "normalize" it.
- `bill-ex.html` at the repo root is a static design reference for the printed bill, not shipped code.

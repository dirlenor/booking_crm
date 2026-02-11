# Sprint 1 Plan — Project Setup (UI-First)

## Goal
Initialize Next.js + Tailwind + shadcn/ui foundation, configure design system, create base UI components + showcase page, and verify UI in browser with screenshot. No backend/API work.

## Constraints
- UI-first: no backend/API/Supabase until UI is pixel-perfect.
- Avoid interactive CLIs; use non-interactive flags or preflight `--help`.
- Repo already contains `docs/` and `AGENTS.md` at root; target structure expects `app/` at repo root (no `src/`).

## Plan

### 1) Preflight checks
- Verify repo root contents (`docs/`, `AGENTS.md`) to ensure project is created at root.
- Capture CLI flags for shadcn (via `npx shadcn@latest init --help`).

### 2) Initialize Next.js in repo root
- Run create-next-app in `.` using flags to avoid prompts.
- Use TypeScript and **no src dir** to match target structure (flag from `create-next-app --help`).
- If the tool rejects non-empty directory or lacks `--force`, fallback to:
  - create in a temp folder, then move generated app files into repo root
  - preserve `docs/`, `.sisyphus/`, and `AGENTS.md`

### 3) Initialize shadcn/ui
- Run `npx shadcn@latest init` with non-interactive flags discovered in Step 1.
- Configure:
  - Style: Default
  - CSS variables: Yes
  - Tailwind config: `tailwind.config.ts`
  - Components path: `components/ui`
  - Utils path: `lib/utils`

### 4) Apply Design System
- Update `tailwind.config.ts` to add color tokens:
  - Primary `#1e3a5f`, Accent `#f97316`, Neutral `#f3f4f6`
- Update `app/globals.css` to define CSS variables (compatible with shadcn).
- Set fonts in `app/layout.tsx` using `next/font/google`:
  - `Inter` + `Prompt` (Thai support)

### 5) Add base components (shadcn)
- Add via shadcn CLI: `button`, `card`, `input`, `table`, `dialog`, `badge`.

### 6) Create component showcase page
- Create `app/showcase/page.tsx` with:
  - Button variants + sizes
  - Card variants
  - Input states (default, error, disabled, search)
  - Table with mock rows
  - Badge variants (status colors)

### 7) Verify in browser (required)
- Start dev server and open `/showcase`.
- Use Playwright to capture a full-page screenshot at:
  - `docs/phase4-build/sprint1-showcase.png`

### 8) Diagnostics
- Run `lsp_diagnostics` on modified files to ensure clean.

## Skills / Agents to Use
- `frontend-ui-ux` for UI composition and styling.
- `playwright` for browser verification and screenshot.

## Deliverables
- Next.js + Tailwind + shadcn configured
- Design system tokens in Tailwind/CSS vars
- Base UI components installed
- `/showcase` page
- Screenshot of `/showcase`

## Non-Goals
- No backend, Supabase, or API integration
- No feature modules (Dashboard, Customers, etc.) in this sprint

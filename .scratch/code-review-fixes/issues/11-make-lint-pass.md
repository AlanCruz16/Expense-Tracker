# 11: Make lint pass (typed chart tooltip)

**What to build:** `npm run lint` fails on two `no-explicit-any` errors in the reports page's custom chart tooltip, which breaks the "lint must pass before each ticket commit" gate in `docs/agents/git-workflow.md`. Type the tooltip with Recharts' own tooltip types so lint exits 0. The tooltip looks and behaves exactly as before.

**Blocked by:** 00 (Set up Vitest)

**Status:** done

- [x] `npm run lint` exits 0 (warnings may remain; ticket 12 removes the unused-code ones)
- [x] The reports chart tooltip uses Recharts' tooltip types, with no `any` and no lint-disable comments
- [x] A component test covers the tooltip: inactive or empty payload renders nothing; active renders the label and each series name with its value as dollars to two decimals
- [x] Hovering the reports charts shows the same tooltip as before
- [x] `npm test` and `npm run build` pass

## Comments

- Renamed `CustomTooltip` to exported `ChartTooltip` in `reports-dashboard.tsx`, typed with `Partial<Pick<TooltipContentProps<number, string>, 'active' | 'payload' | 'label'>>` from Recharts. Markup unchanged, so hover output is identical.
- New `src/components/reports/chart-tooltip.test.tsx` covers inactive, empty payload, and label + `$x.xx` per series.
- `npm run lint`: 0 errors, 22 warnings (ticket 12). Build needs Supabase env vars; worktree built with placeholder `NEXT_PUBLIC_SUPABASE_*` values.

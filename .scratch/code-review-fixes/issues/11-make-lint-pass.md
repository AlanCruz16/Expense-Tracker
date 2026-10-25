# 11: Make lint pass (typed chart tooltip)

**What to build:** `npm run lint` fails on two `no-explicit-any` errors in the reports page's custom chart tooltip, which breaks the "lint must pass before each ticket commit" gate in `docs/agents/git-workflow.md`. Type the tooltip with Recharts' own tooltip types so lint exits 0. The tooltip looks and behaves exactly as before.

**Blocked by:** 00 (Set up Vitest)

**Status:** ready-for-agent

- [ ] `npm run lint` exits 0 (warnings may remain; ticket 12 removes the unused-code ones)
- [ ] The reports chart tooltip uses Recharts' tooltip types, with no `any` and no lint-disable comments
- [ ] A component test covers the tooltip: inactive or empty payload renders nothing; active renders the label and each series name with its value as dollars to two decimals
- [ ] Hovering the reports charts shows the same tooltip as before
- [ ] `npm test` and `npm run build` pass

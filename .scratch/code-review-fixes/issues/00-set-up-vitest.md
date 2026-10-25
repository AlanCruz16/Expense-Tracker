# 00: Set up Vitest

**What to build:** The repo has no test runner, and every other ticket is built test-first. Add Vitest with React Testing Library so pure helpers, React components and route handlers can all be tested. `npm test` runs the suite once and exits, so implementers and the merger can gate on it.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] `npm test` runs Vitest once (no watch mode) and exits non-zero on failure
- [x] The `@/` path alias resolves in tests the same way it does in the app
- [x] Component tests run in a DOM environment, with Testing Library and jest-dom matchers available
- [x] One smoke test for an existing pure helper and one for an existing component pass
- [x] `npm run lint` and `npm run build` still pass, and test files don't end up in the production build

## Comments

- Tests pick their environment by file extension: `*.test.ts` runs in Node (helpers, route handlers), `*.test.tsx` runs in jsdom with Testing Library and jest-dom. A `.ts` test that needs `window` must be `.tsx`.
- `@types/node` bumped `^20` → `^24`: Vitest 5 needs ≥22 as a peer, and the runtime is Node 24. `@vitejs/plugin-react` left out (peer conflict with next-pwa's `@babel/core`); Vitest compiles JSX without it.
- `npm run lint` still fails on 2 `no-explicit-any` errors in `src/components/reports/reports-dashboard.tsx` that predate this ticket. Fix them separately, e.g. alongside ticket 09, which touches that file.
- Later tickets: pin `TZ` in timezone tests (ticket 01); Radix components may need jsdom polyfills (`ResizeObserver`, pointer capture) added to `src/test/setup-dom.ts`.

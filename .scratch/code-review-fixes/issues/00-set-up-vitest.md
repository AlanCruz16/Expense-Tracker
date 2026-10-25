# 00: Set up Vitest

**What to build:** The repo has no test runner, and every other ticket is built test-first. Add Vitest with React Testing Library so pure helpers, React components and route handlers can all be tested. `npm test` runs the suite once and exits, so implementers and the merger can gate on it.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `npm test` runs Vitest once (no watch mode) and exits non-zero on failure
- [ ] The `@/` path alias resolves in tests the same way it does in the app
- [ ] Component tests run in a DOM environment, with Testing Library and jest-dom matchers available
- [ ] One smoke test for an existing pure helper and one for an existing component pass
- [ ] `npm run lint` and `npm run build` still pass, and test files don't end up in the production build

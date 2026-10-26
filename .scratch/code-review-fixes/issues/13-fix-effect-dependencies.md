# 13: Fix data-loading effect dependencies

**What to build:** Lint warns about missing `useEffect` dependencies on the dashboard overview, the expenses list, the add-expense form and the import review table. Each effect loads data on mount and leaves out the Supabase client, the fetch function or the form it uses. That works today only because the effects run once. Adding the missing dependencies as-is would cause refetch loops, because the client and fetch functions are recreated on every render. Restructure each effect so its dependencies are complete and stable. Each screen should load its data exactly once on mount, just as it does now.

**Blocked by:** 10 (Recover from expired session and NaN progress) and 12 (Remove unused code), which edit the same components

**Status:** done

- [x] `npm run lint` shows no `react-hooks/exhaustive-deps` warnings
- [x] The fix is real, not suppressed: no new lint-disable comments, and the stale ones already above two of these effects are removed
- [x] For each of the four components, a test renders it with a mocked Supabase client and checks that the initial data queries run exactly once and the loaded data is shown
- [x] The add-expense form still restores the last-used category and payment method
- [x] The import review table still re-applies import rules when a new set of parsed rows arrives
- [x] Deleting an expense still removes it from the list without a reload
- [x] `npm test`, `npm run lint` and `npm run build` pass

## Comments

Each component now creates its Supabase client once with `useState(createClient)` and defines its fetch function inside the effect, so the deps are complete and stable: `[supabase]`, plus the stable `setValue` in the form and `initialData` in the review table. The tests mock `createClient` to return a fresh object on every call, so a naive deps fix makes them fail with a refetch loop (checked). `src/test/fake-supabase.ts` gained `gte`/`lte`/`limit`/`single` and a `selects` log. The `rules` unused-var warning in review-table.tsx is still there; the spec puts it out of scope.

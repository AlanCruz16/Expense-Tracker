# 13: Fix data-loading effect dependencies

**What to build:** Lint warns about missing `useEffect` dependencies on the dashboard overview, the expenses list, the add-expense form and the import review table. Each effect loads data on mount and leaves out the Supabase client, the fetch function or the form it uses. That works today only because the effects run once. Adding the missing dependencies as-is would cause refetch loops, because the client and fetch functions are recreated on every render. Restructure each effect so its dependencies are complete and stable. Each screen should load its data exactly once on mount, just as it does now.

**Blocked by:** 10 (Recover from expired session and NaN progress) and 12 (Remove unused code), which edit the same components

**Status:** ready-for-agent

- [ ] `npm run lint` shows no `react-hooks/exhaustive-deps` warnings
- [ ] The fix is real, not suppressed: no new lint-disable comments, and the stale ones already above two of these effects are removed
- [ ] For each of the four components, a test renders it with a mocked Supabase client and checks that the initial data queries run exactly once and the loaded data is shown
- [ ] The add-expense form still restores the last-used category and payment method
- [ ] The import review table still re-applies import rules when a new set of parsed rows arrives
- [ ] Deleting an expense still removes it from the list without a reload
- [ ] `npm test`, `npm run lint` and `npm run build` pass

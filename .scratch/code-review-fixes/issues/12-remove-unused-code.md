# 12: Remove unused code flagged by lint

**What to build:** Lint warns about 19 unused imports and variables left over across the add, import, reports and sign-out code. Remove them so lint output only shows warnings worth acting on. No user-visible behaviour changes.

**Blocked by:** 11 (Make lint pass), since both edit the reports dashboard

**Status:** ready-for-agent

- [ ] No `no-unused-vars` warnings remain, except the two listed under "Leave alone"
- [ ] The reports page's unused monthly-income state is removed together with the profile query that only fed it
- [ ] The unused `request` parameter of the sign-out handler is dropped, and sign-out still works
- [ ] The add-expense form's unused caught error is dropped (`catch {}`) without changing what the user sees on failure
- [ ] Add expense, import review, reports and sign-out still work as before
- [ ] `npm test`, `npm run lint` and `npm run build` pass

**Leave alone:**
- The unused `rules` state in the import review table (out of scope in `spec.md`)
- The unused Supabase client import in the receipt-analysis route (ticket 02 uses it for the auth check)
- The four `react-hooks/exhaustive-deps` warnings: fixing them means restructuring data fetching, not cleanup

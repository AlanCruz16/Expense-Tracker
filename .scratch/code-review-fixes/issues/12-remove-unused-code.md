# 12: Remove unused code flagged by lint

**What to build:** Lint warns about 19 unused imports and variables left over across the add, import, reports and sign-out code. Remove them so lint output only shows warnings worth acting on. No user-visible behaviour changes.

**Blocked by:** 11 (Make lint pass), since both edit the reports dashboard

**Status:** done

- [x] No `no-unused-vars` warnings remain, except the two listed under "Leave alone"
- [x] The reports page's unused monthly-income state is removed together with the profile query that only fed it
- [x] The unused `request` parameter of the sign-out handler is dropped, and sign-out still works
- [x] The add-expense form's unused caught error is dropped (`catch {}`) without changing what the user sees on failure
- [x] Add expense, import review, reports and sign-out still work as before
- [x] `npm test`, `npm run lint` and `npm run build` pass

**Leave alone:**
- The unused `rules` state in the import review table (out of scope in `spec.md`)
- The unused Supabase client import in the receipt-analysis route (ticket 02 uses it for the auth check)
- The four `react-hooks/exhaustive-deps` warnings: fixing them means restructuring data fetching, not cleanup

## Comments

Removed the unused imports in the add page, add-expense form, import review table and reports dashboard. Reports no longer queries `profiles` for the unused monthly income, and its test fake drops the profiles stub. Sign-out's `POST()` takes no params. Its route test now calls `POST()` and still checks that sign-out runs before the redirect to `/login`. The add-expense form had no unused caught error: the warning was an unused `e` on the amount input's `onFocus`, so that param was dropped instead. Lint now shows only `rules` plus the four exhaustive-deps warnings. The receipt-analysis route no longer warns because ticket 02 uses that import.

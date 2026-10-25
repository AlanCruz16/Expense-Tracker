# 05: Clear message when deleting an in-use category or payment method

**What to build:** Deleting a category or payment method that any expense (or import rule) uses always fails at the database with a foreign-key violation, and the user sees only a generic "Failed to delete" toast, even though the confirm dialog implies the delete will go through. Decision: **block the delete and explain why** (keep the restrictive FK; don't null out or reassign data). Deleting an unused one keeps working.

**Blocked by:** 00 (Set up Vitest)

**Status:** done

- [x] Trying to delete a category used by expenses or import rules shows a clear message saying it can't be deleted and how many expenses use it
- [x] The same applies to payment methods used by expenses
- [x] The confirm dialog wording no longer promises a delete that will be refused (or the check happens before the dialog)
- [x] Deleting an unused category or payment method still works
- [x] No expense data is changed or lost

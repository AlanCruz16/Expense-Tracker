# 08: Validate amounts before import

**What to build:** In the import review table, clearing an amount stores `NaN`. That serializes to `null` and makes the whole batch insert fail with a generic error. Amounts the AI extracts as negatives (debits like `-45.00`) are inserted as-is and reduce the user's totals. The review step should catch bad amounts before the user imports.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Rows with an empty, zero, or non-numeric amount are visibly flagged in the review table
- [ ] The import button is disabled (or the import refuses with a clear message) while any selected row has an invalid amount
- [ ] Negative amounts from AI extraction are turned into positive values when shown for review
- [ ] Once all amounts are valid, the batch inserts successfully

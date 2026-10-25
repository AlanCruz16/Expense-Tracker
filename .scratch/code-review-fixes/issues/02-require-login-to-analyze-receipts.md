# 02: Require login to analyze receipts

**What to build:** The receipt-analysis API endpoint accepts requests from anyone, and each one is a billed Gemini vision call. Only signed-in users should be able to use it, and oversized images should be refused before the model is called. Smart Import keeps working as before for a signed-in user.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A request without a valid Supabase session gets a 401, and no Gemini call is made
- [ ] An image over a sensible size cap (a few MB of decoded data) gets a 413, and no Gemini call is made
- [ ] A signed-in user can still upload a receipt on the import page and get extracted expenses
- [ ] The unused Supabase client import is either used for the auth check or removed

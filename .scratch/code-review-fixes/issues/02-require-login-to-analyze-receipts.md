# 02: Require login to analyze receipts

**What to build:** The receipt-analysis API endpoint accepts requests from anyone, and each one is a billed Gemini vision call. Only signed-in users should be able to use it, and oversized images should be refused before the model is called. Smart Import keeps working as before for a signed-in user.

**Blocked by:** 00 (Set up Vitest)

**Status:** done

- [x] A request without a valid Supabase session gets a 401, and no Gemini call is made
- [x] An image over a sensible size cap (a few MB of decoded data) gets a 413, and no Gemini call is made
- [x] A signed-in user can still upload a receipt on the import page and get extracted expenses
- [x] The unused Supabase client import is either used for the auth check or removed

## Comments

- The route calls `supabase.auth.getUser()` before parsing the body. No user means a 401. A `typeof image !== 'string'` guard returns a 400.
- The cap is `MAX_IMAGE_BYTES` (3 MB decoded) in `src/lib/receipt-image.ts`, together with `decodedByteLength()`, which computes the size from the base64 length without decoding. It lives outside the route file because Next.js rejects non-standard route exports. 3 MB keeps the base64 JSON under Vercel's 4.5 MB body limit, so larger images were already failing before this change.
- Tests in `src/app/api/analyze-receipt/route.test.ts` mock Supabase, `ai` and `@ai-sdk/google`. The signed-in path is verified only with those mocks; nobody has run it end to end with a real login on `/import`. The client's same-origin `fetch` sends cookies, and `src/proxy.ts` refreshes the session on `/api/*`.
- The import page still shows a generic "Analysis failed" on a 401 or 413. Ticket 07 owns surfacing those errors.

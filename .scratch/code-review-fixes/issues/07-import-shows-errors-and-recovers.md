# 07: Import shows errors and recovers

**What to build:** When receipt analysis fails (API error, oversized image, network drop), the error is thrown inside the file reader's async callback, outside the surrounding try/catch. It becomes an unhandled rejection: no toast appears, and the button stays stuck on "Analyzing..." with the file input disabled until the page is reloaded. A failed analysis should tell the user and let them try again.

**Blocked by:** 00 (Set up Vitest)

**Status:** done

- [x] A non-OK response from the analysis endpoint shows an error toast (using the server's message where available)
- [x] A network failure shows an error toast
- [x] In every failure case the button and file input return to their idle state, so the user can retry without reloading
- [x] A successful analysis behaves as before

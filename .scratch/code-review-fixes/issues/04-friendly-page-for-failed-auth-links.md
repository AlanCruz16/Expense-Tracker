# 04: Friendly page for failed or expired auth links

**What to build:** When the code exchange in the auth callback fails, users are redirected to an error route that doesn't exist, so they hit a 404. This happens with expired links, and with reset emails opened in a different browser or mail app (no PKCE verifier cookie there). It breaks the new forgot-password flow for many mobile users. Add a real page that explains what happened and offers a way forward.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A failed exchange lands on a page that explains the link is invalid or expired, styled like the other auth pages
- [ ] The page links back to login and to forgot-password, and mentions opening the link in the same browser the request was made from
- [ ] The page is reachable without a session (middleware doesn't bounce it to login)

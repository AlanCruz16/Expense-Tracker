# 04: Friendly page for failed or expired auth links

**What to build:** When the code exchange in the auth callback fails, users are redirected to an error route that doesn't exist, so they hit a 404. This happens with expired links, and with reset emails opened in a different browser or mail app (no PKCE verifier cookie there). It breaks the new forgot-password flow for many mobile users. Add a real page that explains what happened and offers a way forward.

**Blocked by:** 00 (Set up Vitest)

**Status:** done

- [x] A failed exchange lands on a page that explains the link is invalid or expired, styled like the other auth pages
- [x] The page links back to login and to forgot-password, and mentions opening the link in the same browser the request was made from
- [x] The page is reachable without a session (middleware doesn't bounce it to login)

## Comments

- New page at `src/app/auth/auth-code-error/page.tsx`, the route `/auth/callback` already redirects to. It uses the same centered Card layout as `/login` and `/reset-password`.
- There is no separate forgot-password route. Forgot password is a button on `/login`, so both "Back to login" and "Get a new reset link" go to `/login`.
- The page sits outside the `(dashboard)` group, which is where the login check happens. `src/proxy.ts` only refreshes the session and never redirects. `src/proxy.test.ts` checks that a signed-out request to the page goes through.
- `npm run build` needs `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` to prerender `/login`. A worktree has no `.env.local`, so the build was run with placeholder values.

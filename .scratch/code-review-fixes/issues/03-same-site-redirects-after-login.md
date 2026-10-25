# 03: Only allow same-site redirects after login

**What to build:** The auth callback copies the `next` query parameter into the redirect URL without checking it. A link like `?next=@evil.com` therefore sends a freshly signed-in user to another site. The callback also trusts the `x-forwarded-host` header for the redirect host. After login or password recovery, users should only ever be sent to a path inside this app.

**Blocked by:** 00 (Set up Vitest)

**Status:** ready-for-agent

- [ ] `next` is only honored when it is a relative path starting with exactly one `/` (not `//`, `/\`, or anything containing a scheme or `@` host trick)
- [ ] Any rejected or missing `next` falls back to the dashboard
- [ ] The redirect host comes from the request's own origin, not from `x-forwarded-host`
- [ ] Normal login and the forgot-password flow still land on the intended page

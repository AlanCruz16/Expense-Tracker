# 03: Only allow same-site redirects after login

**What to build:** The auth callback copies the `next` query parameter into the redirect URL without checking it. A link like `?next=@evil.com` therefore sends a freshly signed-in user to another site. The callback also trusts the `x-forwarded-host` header for the redirect host. After login or password recovery, users should only ever be sent to a path inside this app.

**Blocked by:** 00 (Set up Vitest)

**Status:** done

- [x] `next` is only honored when it is a relative path starting with exactly one `/` (not `//`, `/\`, or anything containing a scheme or `@` host trick)
- [x] Any rejected or missing `next` falls back to the dashboard
- [x] The redirect host comes from the request's own origin, not from `x-forwarded-host`
- [x] Normal login and the forgot-password flow still land on the intended page

## Comments

- `sameSitePath()` in `src/app/auth/callback/route.ts` rejects `next` unless it starts with `/` but not `//` or `/\`. It then resolves `next` against the request origin. It rejects the value if the origin changed, which catches tabs and newlines that the URL parser strips (`/\t/evil.com`). It also rejects a normalized path that starts with `//` (`/.//evil.com`). The value it returns is pathname + search + hash.
- `/@evil.com` is accepted on purpose: it resolves to the local path `/@evil.com` on this host. The rule is "no host change", not "no `@` character". A bare `@evil.com` is rejected because it doesn't start with `/`.
- The `x-forwarded-host` and `NODE_ENV` branches are gone. Every redirect uses `new URL(request.url).origin`, which on Vercel is the public host.
- Tests in `src/app/auth/callback/route.test.ts` mock Supabase's `exchangeCodeForSession`. Nobody has run the real email login or password-reset flow end to end.

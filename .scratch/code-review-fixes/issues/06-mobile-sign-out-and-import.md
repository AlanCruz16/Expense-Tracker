# 06: Sign out and Smart Import on mobile

**What to build:** Sign Out and Smart Import only appear in the desktop sidebar, which is hidden below the `md` breakpoint. On a phone or in the installed PWA, a user can't log out (a real risk on shared devices) and can't reach `/import`. Make both reachable from the mobile navigation.

**Blocked by:** 00 (Set up Vitest)

**Status:** ready-for-agent

- [ ] On a phone-width viewport, a user can reach Smart Import from the navigation
- [ ] On a phone-width viewport, a user can sign out and ends up on the login page with the session cleared
- [ ] The mobile nav stays usable at small widths (no overflow or cramped tap targets)
- [ ] Desktop navigation is unchanged

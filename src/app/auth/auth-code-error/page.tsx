import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

// /auth/callback lands here when exchangeCodeForSession fails: an expired or reused link,
// or one opened in a different browser or mail app than the one that requested it (no PKCE cookie there).
export default function AuthCodeErrorPage() {
  return (
    <div className="flex items-center justify-center min-h-[100dvh] bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Link didn&apos;t work</CardTitle>
          <CardDescription className="text-center">
            This sign-in or password reset link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Links only work once and expire after a while. They also have to be opened in the same
            browser you requested them from, so a link opened from a mail app or another browser
            will fail.
          </p>
          <p>Request a new link, then open it on this device in that browser.</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/login">Back to login</Link>
          </Button>
          {/* Forgot password lives on the login page: enter your email, then tap "Forgot password?" */}
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Get a new reset link</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const error = searchParams.error

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-destructive">
          Authentication Error
        </CardTitle>
        <CardDescription className="text-center">
          {error === "Configuration" && "There is a problem with the server configuration."}
          {error === "AccessDenied" && "You do not have permission to sign in."}
          {error === "Verification" && "The verification token has expired or has already been used."}
          {!error && "An error occurred during authentication."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href="/auth/signin">
            Try again
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

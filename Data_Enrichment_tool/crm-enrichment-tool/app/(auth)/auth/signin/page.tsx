import { SignInButton } from "@/components/auth/SignInButton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignInPage() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          CRM Enrichment Tool
        </CardTitle>
        <CardDescription className="text-center">
          Sign in to start enriching your CRM data with AI-powered insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignInButton />
        <p className="text-xs text-center text-muted-foreground mt-4">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </CardContent>
    </Card>
  )
}

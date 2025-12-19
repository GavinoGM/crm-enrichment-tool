import { auth, signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

export async function UserMenu() {
  const session = await auth()

  if (!session?.user) {
    return null
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <User className="h-4 w-4" />
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium">{session.user.name}</span>
          <span className="text-xs text-muted-foreground">{session.user.email}</span>
        </div>
      </div>
      <form
        action={async () => {
          "use server"
          await signOut({ redirectTo: "/auth/signin" })
        }}
      >
        <Button type="submit" variant="ghost" size="icon">
          <LogOut className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}

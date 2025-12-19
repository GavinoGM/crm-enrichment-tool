import { UserMenu } from "./UserMenu"

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold">Dashboard</h2>
      </div>
      <UserMenu />
    </header>
  )
}

import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isAuth = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
  const isPublicPage = req.nextUrl.pathname === '/'

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/crm-enrichment', req.url))
    }
    return NextResponse.next()
  }

  if (!isAuth && !isPublicPage) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

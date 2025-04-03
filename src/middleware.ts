// Middleware runs before every request,
// use it to check for authentication or other permission checks

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// dont use prisma in middleware, prisma is not available in middleware

export async function middleware(request: NextRequest) {
  // if user on dashboard page, redirect to home
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}

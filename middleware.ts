import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Redirect old image compression URL to new one
  if (request.nextUrl.pathname === '/image/compress') {
    return NextResponse.redirect(new URL('/tools/image?tool=compress', request.url))
  }

  // Update this redirection for JPG to PDF
  if (request.nextUrl.pathname === '/image/to-pdf') {
    return NextResponse.redirect(new URL('/tools/image?tool=to-pdf', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/image/:path*']
} 
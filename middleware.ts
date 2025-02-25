
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  try {
    // Redirect old image compression URL to new one
    if (request.nextUrl.pathname === '/image/compress') {
      return NextResponse.redirect(new URL('/tools/image?tool=compress', request.url))
    }

    // Update this redirection for JPG to PDF
    if (request.nextUrl.pathname === '/image/to-pdf') {
      return NextResponse.redirect(new URL('/tools/image?tool=to-pdf', request.url))
    }

    // Handle API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      const response = NextResponse.next()
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/image/:path*', '/api/:path*']
}

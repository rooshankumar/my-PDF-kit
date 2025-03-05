
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  try {
    // Redirect image compression URLs
    if (request.nextUrl.pathname === '/image/compress' || 
        request.nextUrl.pathname === '/compress-image' || 
        request.nextUrl.pathname === '/image-compressor') {
      return NextResponse.redirect(new URL('/tools/image?tool=compress', request.url))
    }

    // Redirect JPG to PDF URLs
    if (request.nextUrl.pathname === '/image/to-pdf' || 
        request.nextUrl.pathname === '/jpg-to-pdf' || 
        request.nextUrl.pathname === '/convert-image-to-pdf') {
      return NextResponse.redirect(new URL('/tools/image?tool=to-pdf', request.url))
    }

    // Redirect PDF compression URLs
    if (request.nextUrl.pathname === '/pdf/compress' || 
        request.nextUrl.pathname === '/compress-pdf' || 
        request.nextUrl.pathname === '/pdf-compressor') {
      return NextResponse.redirect(new URL('/tools/pdf?tool=compress', request.url))
    }

    // Redirect PDF merge URLs
    if (request.nextUrl.pathname === '/pdf/merge' || 
        request.nextUrl.pathname === '/merge-pdf' || 
        request.nextUrl.pathname === '/pdf-merger') {
      return NextResponse.redirect(new URL('/tools/pdf?tool=merge', request.url))
    }

    // Redirect PDF split URLs
    if (request.nextUrl.pathname === '/pdf/split' || 
        request.nextUrl.pathname === '/split-pdf' || 
        request.nextUrl.pathname === '/pdf-splitter') {
      return NextResponse.redirect(new URL('/tools/pdf?tool=split', request.url))
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
  matcher: [
    '/image/:path*', 
    '/pdf/:path*', 
    '/api/:path*',
    '/compress-pdf',
    '/merge-pdf',
    '/split-pdf',
    '/jpg-to-pdf',
    '/compress-image',
    '/image-compressor',
    '/pdf-compressor',
    '/pdf-merger',
    '/pdf-splitter',
    '/convert-image-to-pdf'
  ]
}

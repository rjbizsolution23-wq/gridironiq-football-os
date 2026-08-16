export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (next-auth endpoints)
     * - login (the login page itself)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo.svg, robots.txt (public files)
     */
    '/((?!api/auth|login|_next/static|_next/image|favicon.ico|logo.svg|robots.txt).*)',
  ],
}

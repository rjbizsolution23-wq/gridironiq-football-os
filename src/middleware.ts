import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: [
    '/((?!api/|login|landing|_next/static|_next/image|favicon.ico|logo.svg|robots.txt).*)',
  ],
}

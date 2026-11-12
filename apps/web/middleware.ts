export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/((?!login|setup|api/auth|api/portal-auth|_next/static|_next/image|favicon.ico).*)'],
}

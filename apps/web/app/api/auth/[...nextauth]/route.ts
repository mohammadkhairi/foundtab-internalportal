import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const PORTAL_API_URL = process.env.PORTAL_API_INTERNAL_URL ?? 'http://localhost:4000'

type PortalUser = { id: string; email: string; name: string; role: string }

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null
        try {
          const res = await fetch(`${PORTAL_API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          })
          if (!res.ok) return null
          const user = (await res.json()) as PortalUser
          return { id: user.id, email: user.email, name: user.name, role: user.role }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.role && session.user) {
        (session.user as typeof session.user & { role: string }).role = token.role as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) token.role = (user as typeof user & { role?: string }).role
      return token
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }

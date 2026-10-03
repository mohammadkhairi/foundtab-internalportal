import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

const ALLOWED_EMAILS = (process.env.PORTAL_ALLOWED_EMAILS ?? '').split(',').map((e) => e.trim()).filter(Boolean)
const ADMIN_PASSWORD = process.env.PORTAL_ADMIN_PASSWORD ?? ''

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    CredentialsProvider({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null
        if (!ALLOWED_EMAILS.includes(credentials.email)) return null
        if (credentials.password !== ADMIN_PASSWORD) return null
        return { id: credentials.email, email: credentials.email, name: 'Admin' }
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(user.email)) return false
      return true
    },
    async session({ session }) {
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }

import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import Sidebar from '../src/components/Sidebar'

export const metadata: Metadata = {
  title: 'FoundTab Portal',
  description: 'FoundTab Internal Admin Portal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 p-6 max-w-5xl">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}

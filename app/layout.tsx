import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
// import { SessionProvider } from '../components/SessionProvider'
import { getServerSession } from 'next-auth'
import { authOptions } from '../lib/auth'
import { MainNav } from '../components/MainNav'
import { Providers } from './providers'
import BackgroundPaths from '@/components/BackgroundPaths'

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Student Management App',
  description: 'Manage your student records',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html className='bg-zinc-900' lang="en">
      <body className={`${poppins.className} text-zinc-100 relative min-h-screen`}>
        <div className="fixed inset-0 z-0">
          <BackgroundPaths title="" />
        </div>
        <div className="relative z-10">
          <Providers session={session}>
            <MainNav session={session} />
            {children}
          </Providers>
        </div>
      </body>
    </html>
  )
}
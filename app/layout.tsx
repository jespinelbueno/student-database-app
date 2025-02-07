import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
// import { SessionProvider } from '../components/SessionProvider'
import { getServerSession } from 'next-auth'
import { authOptions } from '../lib/auth'
import { MainNav } from '../components/MainNav'
import { SessionProvider } from 'next-auth/react'
const inter = Inter({ subsets: ['latin'] })

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
      <body className={`${inter.className} text-zinc-100`}>
        <SessionProvider session={session}> 
          <MainNav session={session} />
          {children}
        </SessionProvider> 
      </body>
    </html>
  )
}
"use client"

import Link from "next/link"
import { Session } from "next-auth"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

interface MainNavProps {
  session: Session | null
}

export function MainNav({ session }: MainNavProps) {
  return (
    <div className="border-b border-zinc-700 bg-zinc-800">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="text-zinc-100 font-bold">
          Student Management
        </Link>

        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          {session ? (
            <>
              <span className="text-sm text-zinc-400">
                {session.user.email}
              </span>
              <Button
                variant="outline"
                className="text-zinc-100 border-zinc-700 hover:bg-zinc-700"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/auth/signin">
              <Button
                variant="outline"
                className="text-zinc-100 border-zinc-700 hover:bg-zinc-700"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
} 
"use client"

import Link from "next/link"
import { Session } from "next-auth"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import { Github, Mail } from "lucide-react"

interface MainNavProps {
  session: Session | null
}

export function MainNav({ session }: MainNavProps) {
  return (
    <div className="border-b border-zinc-700 bg-zinc-800">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="text-zinc-100 font-bold text-lg">
            Future Scholars AI
          </Link>

          <nav className="hidden md:flex items-center ml-8">
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center">
          {session ? (
            <div className="flex items-center gap-3">
              <span className="hidden md:inline text-sm text-zinc-400">
                {session.user.email}
              </span>
              <Button
                variant="secondary"
                size="sm"
                className="ml-2"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => signIn("github", { callbackUrl: "/" })}
              >
                <Github className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Sign In with Github</span>
                <span className="md:hidden">Github</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => signIn("google", { callbackUrl: "/" })}
              >
                <Mail className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Sign In with Google</span>
                <span className="md:hidden">Google</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
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
        <div className="flex items-center gap-8">
          <Link href="/" className="text-zinc-100 font-bold text-lg">
            Future Scholars AI
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
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

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <span className="hidden md:inline text-sm text-zinc-400">
                {session.user.email}
              </span>
              <Button
                variant="outline"
                className="text-zinc-100 bg-zinc-500 border-zinc-700 hover:bg-zinc-700"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="text-zinc-100 border-zinc-700 bg-zinc-500 hover:bg-zinc-700"
                onClick={() => signIn("github", { callbackUrl: "/" })}
              >
                <Github className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Sign In with Github</span>
                <span className="md:hidden">Github</span>
              </Button>
              <Button
                variant="outline"
                className="text-zinc-100 border-zinc-700 bg-zinc-500 hover:bg-zinc-700"
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
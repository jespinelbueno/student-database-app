"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Mail, Terminal } from "lucide-react"
import BackgroundPaths from "@/components/BackgroundPaths"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function SignIn() {
  const isDevelopment = process.env.NODE_ENV === "development"
  const [email, setEmail] = useState("dev@example.com")
  const [password, setPassword] = useState("development")

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/",
    })
  }

  return (
    <div className="relative min-h-screen w-full">
      <BackgroundPaths title="FutureScholarsAI" />
      <div className="absolute inset-0 flex items-center justify-center z-50">
        <Card className="w-[400px] bg-zinc-800/90 border-zinc-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-zinc-100">Welcome back</CardTitle>
            <CardDescription className="text-zinc-400">
              Sign in to access the Future Scholars database
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {isDevelopment && (
              <form onSubmit={handleDevLogin} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-zinc-700 border-zinc-600 text-zinc-100"
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-zinc-700 border-zinc-600 text-zinc-100"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-zinc-100"
                >
                  <Terminal className="mr-2 h-4 w-4" />
                  Development Login
                </Button>
              </form>
            )}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-800 px-2 text-zinc-400">
                  Or continue with
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              className="bg-zinc-500 hover:bg-zinc-700 text-zinc-100 border-zinc-600"
              onClick={() => signIn("github", { callbackUrl: "/" })}
            >
              <Github className="mr-2 h-4 w-4" />
              Github
            </Button>
            <Button
              variant="outline"
              className="bg-zinc-500 hover:bg-zinc-700 text-zinc-100 border-zinc-600"
              onClick={() => signIn("google", { callbackUrl: "/" })}
            >
              <Mail className="mr-2 h-4 w-4" />
              Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
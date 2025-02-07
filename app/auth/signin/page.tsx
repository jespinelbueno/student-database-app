"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Mail } from "lucide-react"

export default function SignIn() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900">
      <Card className="w-[400px] bg-zinc-800 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-2xl text-zinc-100">Welcome back</CardTitle>
          <CardDescription className="text-zinc-400">
            Sign in to access the student database
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button
            variant="outline"
            className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 border-zinc-600"
            onClick={() => signIn("github", { callbackUrl: "/" })}
          >
            <Github className="mr-2 h-4 w-4" />
            Github
          </Button>
          <Button
            variant="outline"
            className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 border-zinc-600"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            <Mail className="mr-2 h-4 w-4" />
            Google
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 
"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Mail } from "lucide-react"
import BackgroundPaths from "@/components/BackgroundPaths"

export default function SignIn() {
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
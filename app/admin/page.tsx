"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string | null
  email: string | null
  role: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      router.push("/")
      return
    }

    const fetchUsers = async () => {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    }

    fetchUsers()
  }, [session, router])

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        )
      }
    } catch (error) {
      console.error("Failed to update user role:", error)
    }
  }

  if (session?.user?.role !== "ADMIN") {
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="bg-zinc-800 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-zinc-100">User Management</CardTitle>
          <CardDescription className="text-zinc-400">
            Manage user roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 rounded-lg bg-zinc-700"
              >
                <div className="text-zinc-100">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-zinc-400">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={user.role === "ADMIN" ? "default" : "outline"}
                    onClick={() =>
                      handleRoleChange(user.id, user.role === "ADMIN" ? "USER" : "ADMIN")
                    }
                    className={
                      user.role === "ADMIN"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-zinc-600 hover:bg-zinc-500"
                    }
                  >
                    {user.role === "ADMIN" ? "Remove Admin" : "Make Admin"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
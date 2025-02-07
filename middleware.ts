import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: async ({ req, token }) => {
      // Admin routes
      if (
        req.nextUrl.pathname.startsWith("/admin") ||
        req.nextUrl.pathname.startsWith("/api/admin")
      ) {
        return token?.role === "ADMIN"
      }

      // Protected routes that require authentication
      if (
        req.nextUrl.pathname.startsWith("/api/students") ||
        req.nextUrl.pathname === "/"
      ) {
        return token?.role === "ADMIN" || token?.role === "USER"
      }

      return !!token
    },
  },
})

export const config = {
  matcher: ["/", "/admin/:path*", "/api/admin/:path*", "/api/students/:path*"],
} 
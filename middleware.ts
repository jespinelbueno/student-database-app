import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"


// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 100 // Maximum requests per window
const rateLimitMap = new Map<string, { count: number; timestamp: number }>()

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record) {
    rateLimitMap.set(ip, { count: 1, timestamp: now })
    return false
  }

  if (now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now })
    return false
  }

  if (record.count >= MAX_REQUESTS) {
    return true
  }

  record.count++
  return false
}

export default withAuth({
  callbacks: {
    authorized: async ({ req, token }) => {
      // Get client IP
      const ip = req.headers.get("x-forwarded-for") || "unknown"
      
      // Check rate limit
      if (rateLimit(ip)) {
        return false
      }

      // Add security headers
      const response = NextResponse.next()
      response.headers.set("X-Content-Type-Options", "nosniff")
      response.headers.set("X-Frame-Options", "DENY")
      response.headers.set("X-XSS-Protection", "1; mode=block")
      response.headers.set(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:;"
      )
      response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
      response.headers.set(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), interest-cohort=()"
      )

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
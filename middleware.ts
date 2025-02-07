import { NextResponse } from 'next/server'
// import { withAuth } from "next-auth/middleware"

// Original authentication middleware (commented for reference)
// export default withAuth({
//   callbacks: {
//     authorized: async ({ req, token }) => {
//       // Admin routes
//       if (
//         req.nextUrl.pathname.startsWith("/admin") ||
//         req.nextUrl.pathname.startsWith("/api/admin")
//       ) {
//         return token?.role === "ADMIN"
//       }

//       // Protected routes that require authentication
//       if (
//         req.nextUrl.pathname.startsWith("/api/students") ||
//         req.nextUrl.pathname === "/"
//       ) {
//         return token?.role === "ADMIN" || token?.role === "USER"
//       }

//       return !!token
//     },
//   },
// })

// Temporary middleware that allows all requests
export function middleware() {
  return NextResponse.next()
}

// Original config (commented for reference)
// export const config = {
//   matcher: ["/", "/admin/:path*", "/api/admin/:path*", "/api/students/:path*"],
// }

// Temporary config that matches the same paths but allows all requests
export const config = {
  matcher: ["/", "/admin/:path*", "/api/admin/:path*", "/api/students/:path*"],
} 
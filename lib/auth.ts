import { PrismaAdapter } from "@auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./db"

type UserRole = "ADMIN" | "USER"

declare module "next-auth" {
  interface User {
    role?: UserRole
  }
  interface Session {
    user: {
      id: string
      name: string | null
      email: string | null
      image: string | null
      role: UserRole
    }
  }

  interface JWT {
    id: string
    role: UserRole
    name?: string | null
    email?: string | null
    picture?: string | null
  }
}

const isDevelopment = process.env.NODE_ENV === "development"

// Session security configuration
const MAXIMUM_SESSION_DURATION = 60 * 60 * 24 // 24 hours

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: MAXIMUM_SESSION_DURATION,
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    ...isDevelopment
      ? [
          CredentialsProvider({
            name: "Development",
            credentials: {
              email: { 
                label: "Email", 
                type: "email",
                required: true 
              },
              password: { 
                label: "Password", 
                type: "password",
                required: true,
                minLength: 12
              },
            },
            async authorize(credentials) {
              if (!credentials?.email || !credentials?.password) {
                return null
              }

              // In development, only allow specific credentials
              if (
                credentials.email === "dev@example.com" &&
                credentials.password === "development"
              ) {
                return {
                  id: "dev-user",
                  name: "Development User",
                  email: "dev@example.com",
                  role: "ADMIN",
                }
              }
              return null
            },
          }),
        ]
      : [],
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile',
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          id: user.id,
          role: user.role || "USER",
          iat: Math.floor(Date.now() / 1000),
        }
      }

      // Check token age
      const now = Math.floor(Date.now() / 1000)
      const tokenAge = now - (token.iat as number || 0)
      if (tokenAge > MAXIMUM_SESSION_DURATION) {
        throw new Error("Session expired")
      }

      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
        },
      }
    },
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  // Additional security settings
  debug: process.env.NODE_ENV === "development",
  jwt: {
    maxAge: MAXIMUM_SESSION_DURATION,
  },
} 

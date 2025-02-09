import { PrismaAdapter } from "@auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./db"

type UserRole = "ADMIN" | "USER"

declare module "next-auth" {
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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    ...isDevelopment
      ? [
          CredentialsProvider({
            name: "Development",
            credentials: {
              email: { label: "Email", type: "email" },
              password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
              if (
                credentials?.email === "dev@example.com" &&
                credentials?.password === "development"
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
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          id: user.id,
          role: user.role || "USER",
        }
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
} 
import { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { connectToDatabase } from "@/lib/mongodb"
import { AppUser } from "@/lib/models/AppUser"
import {
  buildRecoveryCodeRecords,
  makeUserId,
  normalizeEmail,
  verifyPassword,
} from "@/lib/server-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = normalizeEmail(credentials?.email ?? "")
        const password = credentials?.password ?? ""
        if (!email || !password) return null

        await connectToDatabase()
        const user = await AppUser.findOne({ email }).lean()
        if (!user || user.provider !== "local" || !user.salt || !user.passwordHash) {
          return null
        }

        const validPassword = await verifyPassword(password, user.salt, user.passwordHash)
        if (!validPassword) return null

        return {
          id: user.userId,
          email: user.email,
          name: user.name,
          image: user.image ?? null,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && (token.uid || token.sub)) {
        session.user.id = (token.uid as string) || token.sub || ""
        if (typeof token.name === "string" && token.name.trim()) {
          session.user.name = token.name
        }
        if (typeof token.email === "string" && token.email.trim()) {
          session.user.email = token.email
        }
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user?.id) {
        token.uid = user.id
        token.sub = user.id
        token.name = user.name
        token.email = normalizeEmail(user.email ?? "")
      }

      const email = normalizeEmail((user?.email || token.email || "") as string)
      if (account?.provider === "google" && email) {
        await connectToDatabase()
        let dbUser = await AppUser.findOne({ email })
        if (!dbUser) {
          const recovery = await buildRecoveryCodeRecords(5)
          dbUser = await AppUser.create({
            userId: makeUserId(),
            email,
            name: user?.name?.trim() || email,
            image: user?.image,
            provider: "google",
            recoveryCodes: recovery.records,
          })
        } else {
          dbUser.name = user?.name?.trim() || dbUser.name
          dbUser.image = user?.image ?? dbUser.image
          dbUser.provider = "google"
          await dbUser.save()
        }
        token.uid = dbUser.userId
        token.sub = dbUser.userId
        token.name = dbUser.name
        token.email = dbUser.email
      } else if (email && !token.uid) {
        await connectToDatabase()
        const dbUser = await AppUser.findOne({ email }).lean()
        if (dbUser?.userId) {
          token.uid = dbUser.userId
          token.sub = dbUser.userId
          token.name = dbUser.name
          token.email = dbUser.email
        }
      }

      return token
    },
    async signIn({ account }) {
      return true
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-for-development",
  debug: process.env.NODE_ENV === "development",
}
